# Smart Scale Integration

Fitman can receive body composition data directly from the **e.volve Bluetooth smart scale** (Fitdays app, model using EAN 8720828067765) over BLE, storing it locally without sending data to any cloud service.

## ⚠️ Medical disclaimer

**The developers of Fitman are not medical professionals.** All body composition metrics beyond raw weight (body fat %, muscle mass, body water, BMR, visceral fat grade, WHR estimate, etc.) are estimates derived from bioelectrical impedance analysis (BIA) and publicly available research formulas. They are not clinically validated measurements and **must not be used for medical diagnosis, treatment decisions, or as a substitute for professional medical advice.** Always consult a qualified healthcare professional.

---

## How it works

The scale uses BLE (Bluetooth Low Energy). When you step on barefoot and grip the handle bar, it sends a small electrical current through your body at two frequencies (20 kHz and 100 kHz) and measures the resistance in 5 body segments (right arm, left arm, trunk, right leg, left leg). This is called **multi-frequency bioelectrical impedance analysis (MF-BIA)**.

Fitman connects to the scale via BLE, captures the raw impedance readings, and uses published BIA research formulas to calculate body composition metrics — the same approach used by the Fitdays app, just running locally on your own hardware.

## BLE protocol (reverse engineered)

**Device:** `e.volve-10765` (BLE name prefix `e.volve`)  
**Service:** `0000FFB0-0000-1000-8000-00805F9B34FB`

| Characteristic | UUID | Direction | Purpose |
|---|---|---|---|
| FFB1 | `0000FFB1-...` | Write | Send user profile to trigger measurement |
| FFB2 | `0000FFB2-...` | Notify | Streaming weight readings |
| FFB3 | `0000FFB3-...` | Indicate | Body composition result packet |

### User profile command (FFB1)

```
FE [unit] [0x00] [age] [height_H] [height_L] [sex] [xor_checksum]
```

- `unit`: `0x00` = kg
- `age`: integer years
- `height`: cm, big-endian 16-bit
- `sex`: `0x01` = male, `0x00` = female
- `xor_checksum`: XOR of all preceding bytes

### Weight packet (FFB2, 12 bytes)

```
[counter] [0x00] [0x07] [0x00] [0xA2] [status] [0x25] [0x61] [weight_H] [weight_L] [0x00] [checksum]
```

**Weight formula:** `(data[8] * 256 + data[9] + 65536) / 1000` → kg

### Body composition packet (FFB3, 43 bytes)

Arrives after stable weight + BIA measurement completes. Repeats every 10 seconds while on scale.

| Bytes | Content | Formula |
|---|---|---|
| 8-9 | Weight (also in FFB2) | `(d[8]*256 + d[9] + 65536) / 1000` → kg |
| 16-17 | Right arm impedance, 20kHz | int16 LE ÷ 10 → Ω |
| 18-19 | Left arm impedance, 20kHz | int16 LE ÷ 10 → Ω |
| 20-21 | Right leg impedance, 20kHz | int16 LE ÷ 10 → Ω |
| 22-23 | Left leg impedance, 20kHz | int16 LE ÷ 10 → Ω |
| 24 | Trunk impedance, 20kHz | integer → Ω |
| 26-27 | Right arm impedance, 100kHz | int16 LE ÷ 10 → Ω |
| 28-29 | Left arm impedance, 100kHz | int16 LE ÷ 10 → Ω |
| 30-31 | Right leg impedance, 100kHz | int16 LE ÷ 10 → Ω |
| 32-33 | Left leg impedance, 100kHz | int16 LE ÷ 10 → Ω |
| 35 | Trunk impedance, 100kHz | integer → Ω |
| 40-41 | Body fat % | BE uint16 ÷ 10 → % |

## Body composition calculations

All derived metrics use published, peer-reviewed BIA formulas. Results will differ slightly from Fitdays (which uses proprietary formulas).

| Metric | Formula source |
|---|---|
| Skeletal muscle mass | Janssen et al. (2000) |
| Total body water | Watson et al. (1980) / Kyle et al. (2001) |
| BMR | Katch-McArdle (lean mass based) |
| Visceral fat grade | Derived from BMI + body fat % + age |
| WHR estimate | Waist estimated from trunk composition; hip from lower body composition |
| Segmental fat/muscle | Impedance index proportional distribution |

## Running the ingestion script

```bash
cd /path/to/Fitman
source backend/.venv/bin/activate
python scripts/scale_ingest.py
```

Step on the scale barefoot and grip the handle bar. The script connects automatically, captures the measurement, and posts it to the Fitman API.

### Run as a service (auto-capture on every measurement)

```bash
sudo cp scripts/scale_ingest.service /etc/systemd/system/
sudo systemctl enable scale_ingest
sudo systemctl start scale_ingest
```

## Calibration scripts

The `scripts/` directory contains the reverse-engineering tools used to decode the protocol:

| Script | Purpose |
|---|---|
| `scale_discover.py` | Raw packet capture — logs all BLE notifications |
| `scale_calibrate.py` | Weight formula calibration using known weights |
| `scale_experiment.py` | Profile variation experiments for decoding unknown bytes |
