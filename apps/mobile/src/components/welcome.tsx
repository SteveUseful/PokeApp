import { useState } from 'react';
import { Text, View } from 'react-native';
import { B, C, Card, Chip, Field, H, Screen, s } from './ui';
import { M, useRaid } from '../store';
export function Welcome() {
  const { run } = useRaid();
  const [name, setName] = useState(''), [code, setCode] = useState(''), [level, setLevel] = useState('40'), [team, setTeam] = useState('Mystic');
  return <Screen><View style={{ paddingTop: 28, gap: 20 }}><Text style={{ color: C.lime, fontSize: 54 }}>◎</Text><H title="Your next raid.
Less waiting around." caption="WELCOME TO RAIDWELL" /><Text style={s.body}>A clear place in line. A host who knows who’s ready. No coins between you and your group.</Text><Card><Text style={s.h2}>Set up your trainer</Text><Text style={s.body}>Match your Pokémon GO name exactly so the host can find your friend request. Your game password is never needed.</Text><Field label="Trainer name" value={name} onChangeText={setName} autoCapitalize="none" autoCorrect={false} maxLength={30} /><Field label="Friend code" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="1234 5678 9012" maxLength={14} /><Field label="Trainer level" value={level} onChangeText={setLevel} keyboardType="number-pad" maxLength={3} /><View style={s.row}>{['Mystic', 'Valor', 'Instinct', 'None'].map(t => <Chip key={t} title={t} selected={team === t} onPress={() => setTeam(t)} />)}</View><B title="Save trainer and explore" onPress={() => run(d => { d.profile = M.profile({ name, code, level, team }); d.onboarded = true; })} /></Card><B title="Explore first · set up later" secondary onPress={() => run(d => { d.onboarded = true; })} /><Text style={s.body}>This build is a device preview. Raids, queues and other trainers are simulated. Your profile and history stay on this device.</Text></View></Screen>;
}
