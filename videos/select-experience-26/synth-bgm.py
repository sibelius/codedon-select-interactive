import numpy as np, wave, sys
SR = 44100
BPM = 120.0
BEAT = 60 / BPM
DUR = 15.0

def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / d)
    return e

def kick(n=int(0.45*SR)):
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph) * np.exp(-t * 7) * 1.0 + 0.3*np.tanh(4*np.sin(ph))*np.exp(-t*30)

rng = np.random.default_rng(7)
def hat(n=int(0.06*SR)):
    x = rng.standard_normal(n)
    x = np.diff(np.concatenate([[0], x]))  # crude highpass
    return x * env(n, 0.0005, 0.018) * 0.25

def clap(n=int(0.25*SR)):
    x = rng.standard_normal(n)
    e = sum(env(n, 0.0008, 0.012) * (np.arange(n) >= int(k*SR)) for k in (0, 0.01, 0.02)) + env(n, 0.001, 0.09)
    return np.convolve(x, np.ones(3)/3, 'same') * e * 0.35

def saw(freq, n):
    t = np.arange(n) / SR
    return 2 * ((t * freq) % 1) - 1

def lp(x, a):  # one-pole lowpass, a in (0,1)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

def add(buf, x, at):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]

def track(drop):
    N = int(DUR * SR)
    L = np.zeros(N)
    # A minor-ish bass pattern (8ths): A1 A1 C2 A1 | G1 G1 E1 G1
    notes = [55.0, 55.0, 65.41, 55.0, 49.0, 49.0, 41.2, 49.0]
    step = BEAT / 2
    nsteps = int(DUR / step)
    for s in range(nsteps):
        t0 = s * step
        beat = s // 2
        pre = t0 < drop
        # build section before the drop: kick on beats, then filtered; riser last 2 beats
        if t0 >= drop - 2*BEAT and t0 < drop:
            continue  # breakdown gap before drop
        if s % 2 == 0:
            add(L, kick() * (0.85 if pre else 1.0), t0)
        if s % 2 == 1:
            add(L, hat() * (1.0 if pre else 1.3), t0)
        if not pre and s % 2 == 0:
            add(L, hat() * 0.6, t0)
        if beat % 2 == 1 and s % 2 == 0 and t0 > 3.0:
            add(L, clap(), t0)
        f = notes[s % 8]
        n = int(step * SR * 0.9)
        b = saw(f, n) * env(n, 0.003, 0.16) * (0.22 if pre else 0.3)
        add(L, b, t0)
    # lowpass the bass/drums mix slightly for warmth
    L = lp(L, 0.35)
    # chord stabs after drop (Am: A C E, higher octave)
    for k in range(int((DUR - drop) / BEAT) + 1):
        t0 = drop + k * BEAT + BEAT/2
        n = int(0.18 * SR)
        chord = sum(saw(f, n) for f in (440.0, 523.25, 659.25)) / 3
        add(L, lp(chord, 0.25) * env(n, 0.002, 0.08) * 0.22, t0)
    # riser into the drop: noise sweep over 2 beats
    n = int(2 * BEAT * SR)
    r = rng.standard_normal(n) * np.linspace(0, 1, n) ** 2
    add(L, lp(r, 0.15) * 0.35, drop - 2*BEAT)
    # impact at drop
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2*np.pi*(38 + 60*np.exp(-t*6))*t) * np.exp(-t*2.2) * 0.9
    add(L, boom + lp(rng.standard_normal(n), 0.05) * np.exp(-t*3) * 0.4, drop)
    # intro fade-in & outro fade-out
    fi = int(0.05 * SR); L[:fi] *= np.linspace(0, 1, fi)
    fo = int(0.8 * SR); L[-fo:] *= np.linspace(1, 0, fo)
    L = np.tanh(L * 1.3)
    L = L / np.max(np.abs(L)) * 0.89
    return L

def write(path, x):
    s = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    st = np.column_stack([s, s]).ravel()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

out = sys.argv[1]
for name, drop in (("hype", 11.5), ("invite", 10.5), ("tour", 11.2)):
    write(f"{out}/{name}.wav", track(drop))
    print(name, "ok")
