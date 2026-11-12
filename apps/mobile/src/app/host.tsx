import { useState } from 'react';
import { Alert, Image, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { E, M, P, useRaid } from '../store';
import { pickRaidScreenshot } from '../lib/ocr';
import { B, C, Card, Chip, Field, H, Screen, s } from '../components/ui';
export default function Host() {
  const { state, run } = useRaid();
  const [step, setStep] = useState(0), [name, setName] = useState(''), [form, setForm] = useState('Standard');
  const [minutes, setMinutes] = useState('25'), [timerAt, setTimerAt] = useState(() => Date.now());
  const [spots, setSpots] = useState(5), [trainer, setTrainer] = useState(state.profile.name), [friendCode, setCode] = useState(state.profile.code);
  const [note, setNote] = useState(''), [privateRoom, setPrivate] = useState(false), [team, setTeam] = useState('Unknown');
  const [weather, setWeather] = useState('Unknown'), [minReady, setMinReady] = useState('3'), [locals, setLocals] = useState('0');
  const [busy, setBusy] = useState(false), [ocr, setOCR] = useState<any>(null), [reviewed, setReviewed] = useState(false);
  async function importImage() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await pickRaidScreenshot();
      if (!result) return;
      setOCR(result); setReviewed(false); setName(result.name); setForm(result.parsed.detectedForm || (result.parsed.mega ? 'Mega' : 'Standard'));
      if (result.parsed.timers.length === 1) { setMinutes((result.parsed.timers[0].seconds / 60).toFixed(2)); setTimerAt(Date.now()); }
    } catch (error: any) { Alert.alert('Could not read this screenshot', `${error.message}\nYou can still enter raid details manually.`); }
    finally { setBusy(false); }
  }
  function next() {
    if (step === 0 && (!name.trim() || !Number.isFinite(Number(minutes)) || Number(minutes) < 5 || Number(minutes) > 60)) { Alert.alert('Check raid details', 'Choose the boss and enter 5–60 minutes remaining.'); return; }
    if (step === 0 && ocr && !reviewed) { Alert.alert('Review the screenshot', 'Confirm the name, form and raid timer before continuing.'); return; }
    if (step === 1 && (!Number.isInteger(Number(locals)) || Number(locals) < 0 || Number(locals) > 100 || !Number.isInteger(Number(minReady)) || Number(minReady) < 1 || Number(minReady) > spots)) { Alert.alert('Check group size', 'Local players must be a whole number from 0–100. Your ready minimum must fit the guest spots.'); return; }
    setStep(step + 1);
  }
  function open() {
    if (state.room || state.queue) { Alert.alert('You already have an active session', 'Finish or leave it before opening another room.'); router.push('/room'); return; }
    const remaining = Number(minutes) - (Date.now() - timerAt) / 60000;
    if (!Number.isFinite(remaining) || remaining < 5 || remaining > 60) { Alert.alert('Update the raid timer', 'There must be at least five minutes left to coordinate.'); setStep(0); return; }
    if (run(d => {
      d.profile = M.profile({ ...d.profile, name: trainer, code: friendCode });
      E.createRoom(d, { name: P.formatBoss(name, form), form, minutes: remaining, spots, code: d.profile.code, visibility: privateRoom ? 'private' : 'public', gymTeam: team, weather, locals: Number(locals), minReady: Number(minReady), note, recognition: ocr ? 'Screenshot reviewed by host' : 'Host entered' });
    })) router.push('/room');
  }
  return <Screen><H title={['Tell us about the raid.', 'Build your group.', 'Ready to host?'][step]} caption={`HOST A RAID · STEP ${step + 1} OF 3`} /><View style={s.row}>{['Raid', 'Group', 'Review'].map((label, i) => <Text key={label} style={[s.tag, { color: step === i ? C.lime : C.muted }]}>{i + 1} · {label}</Text>)}</View>
    {step === 0 ? <>
      <Card><Text style={s.h2}>Let your screenshot do the typing</Text><Text style={s.body}>Choose the original raid screen. Text is read on your device, then you confirm the details.</Text><B title={busy ? 'Reading screenshot…' : 'Choose gym screenshot'} onPress={importImage} disabled={busy} />
        {ocr ? <><Image source={{ uri: ocr.uri }} style={{ width: '100%', height: 240 }} resizeMode="contain" accessibilityLabel="Original raid screenshot" /><Text style={s.eyebrow}>{ocr.engine}</Text><Text style={s.body}>{ocr.parsed.sourceIsCompanion ? 'This appears to be a companion app. Enter details manually or choose a game screenshot.' : ocr.parsed.exact ? 'A readable name was found. Check the form and timer.' : 'No exact name found. Try a suggestion or enter it below.'}</Text><View style={s.row}>{ocr.parsed.candidates.map((x: any) => <Chip key={x.name} title={x.name} selected={name === x.name} onPress={() => { setName(x.name); setReviewed(false); }} />)}</View>{ocr.parsed.timers.length > 1 ? <><Text style={s.body}>Several times were found. Choose the raid countdown.</Text><View style={s.row}>{ocr.parsed.timers.map((t: any, i: number) => <Chip key={`${t.raw}-${i}`} title={t.raw} selected={Number(minutes) === t.seconds / 60} onPress={() => { setMinutes((t.seconds / 60).toFixed(2)); setTimerAt(Date.now()); setReviewed(false); }} />)}</View></> : null}<Text selectable style={s.body}>{ocr.parsed.text || 'No readable text.'}</Text><B title="Remove screenshot · enter manually" secondary onPress={() => { setOCR(null); setReviewed(false); }} /></> : null}
      </Card>
      <Field label="Pokémon name" value={name} onChangeText={x => { setName(x); setReviewed(false); }} placeholder="Search or type the boss name" />
      <View style={s.row}>{E.bosses.filter((b: any) => !name || b.name.toLowerCase().includes(name.toLowerCase())).slice(0, 6).map((b: any) => <Chip key={b.id} title={b.name} selected={name === b.name} onPress={() => { setName(b.name); setForm(b.form); setReviewed(false); }} />)}</View>
      <Field label="Form" value={form} onChangeText={x => { setForm(x); setReviewed(false); }} />
      <Field label="Minutes remaining" value={minutes} keyboardType="decimal-pad" onChangeText={x => { setMinutes(x); setTimerAt(Date.now()); setReviewed(false); }} /><Text style={s.body}>The countdown keeps running while you set up the group.</Text>
      {ocr ? <View style={[s.row, { flexWrap: 'nowrap' }]}><Switch accessibilityLabel="I checked the boss, form and timer" value={reviewed} onValueChange={setReviewed} trackColor={{ true: '#506b34' }} /><Text style={[s.body, { flex: 1 }]}>I checked the boss, form and raid timer against the screenshot.</Text></View> : null}
      <Text style={s.body}>Manual entry is welcome. Screenshot recognition is evidence about the image, not a rating of you.</Text>
    </> : step === 1 ? <>
      <Card><Text style={s.h2}>How many remote guests?</Text><View style={s.row}>{[3, 5, 8, 10].map(n => <Chip key={n} title={String(n)} selected={spots === n} onPress={() => { setSpots(n); if (Number(minReady) > n) setMinReady(String(n)); }} />)}</View><Text style={s.body}>Groups over five use invitation batches. Confirm the current in-game restrictions and cooldown before inviting.</Text></Card>
      <Field label="Minimum ready guests to proceed" value={minReady} onChangeText={setMinReady} keyboardType="number-pad" />
      <Field label="Local players with you" value={locals} onChangeText={setLocals} keyboardType="number-pad" />
      <Text style={s.label}>Gym team</Text><View style={s.row}>{['Unknown', 'Mystic', 'Valor', 'Instinct'].map(t => <Chip key={t} title={t} selected={team === t} onPress={() => setTeam(t)} />)}</View>
      <Text style={s.label}>Weather · host reported</Text><View style={s.row}>{['Unknown', 'Sunny', 'Clear', 'Rainy', 'Partly cloudy', 'Cloudy', 'Windy', 'Snow', 'Fog'].map(t => <Chip key={t} title={t} selected={weather === t} onPress={() => setWeather(t)} />)}</View>
      <Card><View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.h2}>Invitation only</Text><Switch accessibilityLabel="Invitation-only room" value={privateRoom} onValueChange={setPrivate} trackColor={{ true: '#506b34' }} /></View><Text style={s.body}>The device preview simulates invited guests. Cross-device room links need the multiplayer service.</Text></Card>
      <Field label="Note for your group" value={note} onChangeText={setNote} multiline maxLength={180} placeholder="Example: Please be online before I send invites." />
    </> : <>
      <Card><Text style={s.h2}>{P.formatBoss(name, form)}</Text><Text style={s.body}>{form} · {privateRoom ? 'Invitation only' : 'Public room'} · {spots} remote guest spots</Text><Text style={s.body}>Ready minimum: {minReady} · Local players: {locals}</Text><Text style={s.body}>{team} gym · {weather} weather</Text>{note ? <Text style={s.body}>{note}</Text> : null}</Card>
      <Field label="Exact trainer name" value={trainer} onChangeText={setTrainer} autoCapitalize="none" autoCorrect={false} maxLength={30} />
      <Field label="Friend code" value={friendCode} onChangeText={setCode} keyboardType="number-pad" maxLength={14} placeholder="1234 5678 9012" />
      <Text style={s.body}>This build uses simulated players. The next screen lets you manage readiness, replace a missing guest and send invitation batches.</Text>
      <B title="Open preview room" onPress={open} />
    </>}
    {step < 2 ? <B title={step === 0 ? 'Next · group setup' : 'Next · review your room'} onPress={next} disabled={busy} /> : null}
    {step > 0 ? <B title="Back" secondary onPress={() => setStep(step - 1)} /> : null}
  </Screen>;
}
