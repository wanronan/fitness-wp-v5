import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Activity, ArrowLeftRight, BarChart3, Check, ChevronRight, Clock3, Database,
  Dumbbell, History, Home, Info, Play, Save, Settings2, TimerReset, Trophy, UserRound,
  Download, Upload, X
} from 'lucide-react';
import {
  baseline, exercises, guidance, nutritionReference, people, weekdayLabels, weekdayOrder,
  type PersonId, type WeekdayId
} from './data';
import { db, type ExerciseEntry, type MeasureEntry, type SetEntry, type WorkoutSession } from './lib/db';
import { exportBackup, importBackup } from './lib/backup';
import { formatSeconds, parseRepTarget, parseSetCount, restSeconds, todayWeekday } from './lib/workout';

type Tab = 'hoje' | 'treino' | 'progresso' | 'historico' | 'perfil';

type DraftExercise = ExerciseEntry & { restLabel: string; restSeconds: number };

const PERSON_KEY = 'fitness-wp-person';
const TAB_KEY = 'fitness-wp-tab';

function currentPerson(): PersonId {
  const saved = localStorage.getItem(PERSON_KEY);
  return saved === 'fernanda' ? 'fernanda' : 'wanderson';
}

function currentTab(): Tab {
  const saved = localStorage.getItem(TAB_KEY) as Tab | null;
  return saved && ['hoje','treino','progresso','historico','perfil'].includes(saved) ? saved : 'hoje';
}

function dayForToday(): WeekdayId {
  const t = todayWeekday();
  return weekdayOrder.includes(t as WeekdayId) ? t as WeekdayId : 'segunda';
}

function shortEmphasis(text: string) {
  return text.split('|')[0].trim();
}

function ExerciseSkeleton() {
  return <div className="panel skeleton-panel"><div className="skeleton big"/><div className="skeleton"/><div className="skeleton short"/></div>;
}

function ProfileToggle({ person, onChange }: { person: PersonId; onChange: (p: PersonId) => void }) {
  return (
    <div className="profile-toggle" aria-label="Escolher perfil">
      {(Object.keys(people) as PersonId[]).map(id => (
        <button key={id} className={person === id ? 'active' : ''} onClick={() => onChange(id)}>
          <span className={`avatar avatar-${people[id].accent}`}>{people[id].initials}</span>
          <span><b>{people[id].name}</b><small>{people[id].subtitle}</small></span>
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
}

function App() {
  const [person, setPerson] = useState<PersonId>(currentPerson);
  const [tab, setTab] = useState<Tab>(currentTab);
  const [selectedDay, setSelectedDay] = useState<WeekdayId>(dayForToday);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [measures, setMeasures] = useState<MeasureEntry[]>([]);
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [timer, setTimer] = useState<{ open: boolean; left: number; total: number; label: string }>({ open:false,left:0,total:0,label:'' });
  const [toast, setToast] = useState('');

  const load = async () => {
    const [s, m] = await Promise.all([
      db.sessions.where('person').equals(person).reverse().sortBy('finishedAt'),
      db.measures.where('person').equals(person).reverse().sortBy('date')
    ]);
    setSessions(s);
    setMeasures(m);
  };

  useEffect(() => { load(); }, [person]);
  useEffect(() => { localStorage.setItem(PERSON_KEY, person); }, [person]);
  useEffect(() => { localStorage.setItem(TAB_KEY, tab); }, [tab]);
  useEffect(() => {
    if (!timer.open) return;
    const int = window.setInterval(() => setTimer(t => t.left <= 1 ? {...t,left:0} : {...t,left:t.left-1}), 1000);
    return () => window.clearInterval(int);
  }, [timer.open]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const today = dayForToday();
  const dayExercises = useMemo(() => exercises.filter(e => e.day === selectedDay && e.prescription[person] !== 'Descanso'), [selectedDay, person]);
  const todayExercises = useMemo(() => exercises.filter(e => e.day === today && e.prescription[person] !== 'Descanso'), [today, person]);
  const todayRest = today === 'quarta' && person === 'fernanda';

  const latestSession = sessions[0];
  const latestMeasure = measures[0];
  const previousMeasure = measures[1];

  async function changePerson(p: PersonId) {
    setPerson(p);
    setDraft([]);
    setStartedAt(null);
  }

  async function startWorkout(day: WeekdayId = selectedDay) {
    setSelectedDay(day);
    const list = exercises.filter(e => e.day === day && e.prescription[person] !== 'Descanso');
    if (!list.length) {
      setToast('Este perfil está em descanso neste dia.');
      return;
    }
    const history = await db.sessions.where('person').equals(person).reverse().sortBy('finishedAt');
    const built: DraftExercise[] = list.map(ex => {
      const setCount = parseSetCount(ex.prescription[person]);
      const reps = parseRepTarget(ex.prescription[person]);
      const previous = history.flatMap(h => h.exercises).find(h => h.exerciseId === ex.id);
      const sets: SetEntry[] = Array.from({ length: setCount }, (_, i) => ({
        setNumber: i + 1,
        weight: previous?.sets?.[i]?.weight ?? null,
        reps: previous?.sets?.[i]?.reps ?? (reps.min || null),
        rir: previous?.sets?.[i]?.rir ?? null,
        done: false
      }));
      return {
        exerciseId: ex.id,
        exerciseName: ex.exercise,
        prescription: ex.prescription[person],
        targetRir: ex.rir[person],
        sets,
        restLabel: ex.rest,
        restSeconds: restSeconds(ex.rest)
      };
    });
    setDraft(built);
    setStartedAt(new Date().toISOString());
    setTab('treino');
  }

  function patchSet(exIndex: number, setIndex: number, patch: Partial<SetEntry>) {
    setDraft(current => current.map((ex, i) => i !== exIndex ? ex : ({
      ...ex,
      sets: ex.sets.map((s, j) => j !== setIndex ? s : ({ ...s, ...patch }))
    })));
  }

  function toggleSet(exIndex: number, setIndex: number) {
    const ex = draft[exIndex];
    const set = ex.sets[setIndex];
    patchSet(exIndex, setIndex, { done: !set.done });
    if (!set.done) setTimer({ open:true, left:ex.restSeconds, total:ex.restSeconds, label:ex.exerciseName });
  }

  async function finishWorkout() {
    if (!draft.length || !startedAt) return;
    const done = draft.flatMap(e => e.sets).filter(s => s.done).length;
    const total = draft.flatMap(e => e.sets).length;
    const first = exercises.find(e => e.day === selectedDay)!;
    await db.sessions.add({
      person,
      day: selectedDay,
      dayLabel: weekdayLabels[selectedDay],
      emphasis: first.emphasis,
      startedAt,
      finishedAt: new Date().toISOString(),
      completion: total ? Math.round(done / total * 100) : 0,
      exercises: draft.map(({restLabel,restSeconds,...e}) => e)
    });
    setDraft([]);
    setStartedAt(null);
    await load();
    setTab('hoje');
    setToast(`Treino salvo: ${done}/${total} séries concluídas.`);
  }

  const completedSets = draft.flatMap(e => e.sets).filter(s => s.done).length;
  const totalSets = draft.flatMap(e => e.sets).length;
  const draftProgress = totalSets ? Math.round(completedSets / totalSets * 100) : 0;

  return (
    <div className={`app person-${person}`}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon"><Dumbbell size={20}/></div>
          <div><span>FITNESS</span><b>WP</b></div>
        </div>
        <button className="profile-chip" onClick={() => setTab('perfil')}>
          <span className={`avatar avatar-${people[person].accent}`}>{people[person].initials}</span>
          {people[person].name}
        </button>
      </header>

      <main className="content">
        {tab === 'hoje' && (
          <section>
            <ProfileToggle person={person} onChange={changePerson}/>
            <div className="hero-card">
              <div className="eyebrow">TREINO DE HOJE</div>
              {todayRest ? (
                <>
                  <h1>Dia de recuperação</h1>
                  <p>Quarta-feira é descanso para Fernanda conforme a planilha atual.</p>
                  <div className="hero-badges"><span><Activity size={16}/> Recuperação</span><span><Clock3 size={16}/> Sem musculação</span></div>
                </>
              ) : (
                <>
                  <h1>{todayExercises.length ? shortEmphasis(todayExercises[0].emphasis) : 'Sem treino programado'}</h1>
                  <p>{todayExercises[0]?.emphasis.split('|')[1]?.trim() || 'Fim de semana ou descanso programado.'}</p>
                  <div className="hero-badges"><span><Dumbbell size={16}/> {todayExercises.length} exercícios</span><span><Clock3 size={16}/> RIR guiado</span></div>
                  {todayExercises.length > 0 && <button className="primary hero-action" onClick={() => startWorkout(today)}><Play size={18}/> Iniciar treino</button>}
                </>
              )}
            </div>

            <div className="section-title"><div><span>SEMANA</span><h2>Plano atual</h2></div><button onClick={() => setTab('treino')}>Ver ficha <ChevronRight size={18}/></button></div>
            <div className="week-grid">
              {weekdayOrder.map(day => {
                const list = exercises.filter(e => e.day === day && e.prescription[person] !== 'Descanso');
                const rest = !list.length;
                return <button key={day} className={`week-card ${day===today?'today':''}`} onClick={() => {setSelectedDay(day); setTab('treino')}}>
                  <span>{weekdayLabels[day].slice(0,3).toUpperCase()}</span>
                  <b>{rest ? 'Descanso' : shortEmphasis(list[0].emphasis)}</b>
                  <small>{rest ? 'Recuperação' : `${list.length} exercícios`}</small>
                </button>;
              })}
            </div>

            <div className="section-title"><div><span>PAINEL</span><h2>Seu progresso</h2></div></div>
            <div className="metrics-grid">
              <Metric label="Último treino" value={latestSession ? `${latestSession.completion}%` : '—'} sub={latestSession ? latestSession.dayLabel : 'Ainda sem registro'}/>
              <Metric label="Peso atual" value={latestMeasure?.weight ? `${latestMeasure.weight.toFixed(1)} kg` : '—'} sub={previousMeasure?.weight && latestMeasure?.weight ? `${(latestMeasure.weight-previousMeasure.weight).toFixed(1)} kg vs. anterior` : 'Registre em Progresso'}/>
              <Metric label="Sessões" value={String(sessions.length)} sub="salvas neste aparelho"/>
              <Metric label="Próxima revisão" value="30/11" sub="conforme planilha"/>
            </div>

            {latestSession && <div className="panel last-session"><div className="panel-icon"><History size={20}/></div><div><span>ÚLTIMA SESSÃO</span><h3>{latestSession.dayLabel} • {shortEmphasis(latestSession.emphasis)}</h3><p>{new Date(latestSession.finishedAt).toLocaleDateString('pt-BR')} • {latestSession.completion}% concluído</p></div><ChevronRight size={20}/></div>}
          </section>
        )}

        {tab === 'treino' && (
          <section>
            <div className="section-title top-title"><div><span>PLANO DE TREINO</span><h1>{people[person].name}</h1></div><button className="icon-button" onClick={() => setTab('perfil')}><ArrowLeftRight size={18}/></button></div>
            <div className="day-tabs">
              {weekdayOrder.map(day => <button key={day} className={selectedDay===day?'active':''} onClick={() => {setSelectedDay(day);setDraft([]);setStartedAt(null)}}>{weekdayLabels[day].slice(0,3)}</button>)}
            </div>

            {!draft.length ? (
              <>
                {dayExercises.length ? (
                  <>
                    <div className="workout-cover">
                      <span>{weekdayLabels[selectedDay].toUpperCase()}</span>
                      <h2>{shortEmphasis(dayExercises[0].emphasis)}</h2>
                      <p>{dayExercises[0].emphasis.split('|')[1]?.trim()}</p>
                      <div><b>{dayExercises.length}</b> exercícios <i/> <b>{dayExercises.reduce((sum,e)=>sum+parseSetCount(e.prescription[person]),0)}</b> séries</div>
                      <button className="primary" onClick={() => startWorkout(selectedDay)}><Play size={18}/> Iniciar sessão</button>
                    </div>
                    <div className="exercise-preview-list">
                      {dayExercises.map((ex, idx) => <div className="exercise-preview" key={ex.id}>
                        <div className="exercise-number">{String(idx+1).padStart(2,'0')}</div>
                        <div><h3>{ex.exercise}</h3><p>{ex.prescription[person]} • RIR {ex.rir[person]} • descanso {ex.rest}</p></div>
                      </div>)}
                    </div>
                  </>
                ) : <div className="empty-state"><Activity size={34}/><h2>Descanso</h2><p>Não há musculação para {people[person].name} neste dia.</p></div>}
              </>
            ) : (
              <div className="live-workout">
                <div className="live-head">
                  <div><span>SESSÃO EM ANDAMENTO</span><h2>{shortEmphasis(dayExercises[0]?.emphasis || '')}</h2></div>
                  <div className="ring"><b>{draftProgress}%</b></div>
                </div>
                <div className="progress-track"><i style={{width:`${draftProgress}%`}}/></div>
                <p className="progress-copy">{completedSets} de {totalSets} séries concluídas</p>

                {draft.map((ex, exIndex) => (
                  <article className="exercise-card" key={ex.exerciseId}>
                    <div className="exercise-card-head">
                      <div className="exercise-number">{String(exIndex+1).padStart(2,'0')}</div>
                      <div><h3>{ex.exerciseName}</h3><p><b>{ex.prescription}</b> • RIR alvo {ex.targetRir} • {ex.restLabel}</p></div>
                    </div>
                    <div className="set-table header"><span>Série</span><span>Carga</span><span>Reps</span><span>RIR</span><span>Feito</span></div>
                    {ex.sets.map((set, setIndex) => (
                      <div className={`set-table ${set.done?'done':''}`} key={set.setNumber}>
                        <span className="set-number">S{set.setNumber}</span>
                        <label><input aria-label="Carga" type="number" inputMode="decimal" step="0.5" value={set.weight ?? ''} placeholder="kg" onChange={e => patchSet(exIndex,setIndex,{weight:e.target.value===''?null:Number(e.target.value)})}/><small>kg</small></label>
                        <input aria-label="Repetições" type="number" inputMode="numeric" value={set.reps ?? ''} placeholder="reps" onChange={e => patchSet(exIndex,setIndex,{reps:e.target.value===''?null:Number(e.target.value)})}/>
                        <select aria-label="RIR" value={set.rir ?? ''} onChange={e => patchSet(exIndex,setIndex,{rir:e.target.value===''?null:Number(e.target.value)})}><option value="">—</option>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select>
                        <button className={`check-button ${set.done?'active':''}`} onClick={()=>toggleSet(exIndex,setIndex)}>{set.done?<Check size={18}/>:<span/>}</button>
                      </div>
                    ))}
                  </article>
                ))}
                <button className="primary finish-button" onClick={finishWorkout}><Save size={18}/> Finalizar e salvar treino</button>
              </div>
            )}
          </section>
        )}

        {tab === 'progresso' && <ProgressView person={person} measures={measures} onSaved={load}/>} 
        {tab === 'historico' && <HistoryView sessions={sessions} person={person}/>} 
        {tab === 'perfil' && <ProfileView person={person} onChange={changePerson} onImported={load}/>} 
      </main>

      <nav className="bottom-nav">
        {([
          ['hoje',Home,'Hoje'],['treino',Dumbbell,'Treino'],['progresso',BarChart3,'Progresso'],['historico',History,'Histórico'],['perfil',UserRound,'Perfil']
        ] as const).map(([id,Icon,label]) => <button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={20}/><span>{label}</span></button>)}
      </nav>

      {timer.open && <div className="timer-modal" role="dialog" aria-modal="true"><div className="timer-card"><button className="timer-close" onClick={()=>setTimer(t=>({...t,open:false}))}><X/></button><TimerReset size={28}/><span>DESCANSO</span><h2>{formatSeconds(timer.left)}</h2><p>{timer.label}</p><div className="timer-actions"><button onClick={()=>setTimer(t=>({...t,left:Math.max(0,t.left-15)}))}>−15s</button><button onClick={()=>setTimer(t=>({...t,left:t.total}))}>Reiniciar</button><button onClick={()=>setTimer(t=>({...t,left:t.left+15}))}>+15s</button></div><button className="primary" onClick={()=>setTimer(t=>({...t,open:false}))}>Voltar ao treino</button></div></div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ProgressView({ person, measures, onSaved }: { person: PersonId; measures: MeasureEntry[]; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({weight:'',waist:'',abdomen:'',hip:'',bodyFat:'',muscleMass:'',visceralFat:'',notes:''});
  const latest = measures[0];
  const baseRows = baseline[person];
  const points = measures.filter(m => m.weight != null).slice(0, 8).reverse();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const num = (v:string) => v.trim()==='' ? null : Number(v);
    await db.measures.add({
      person,
      date: new Date().toISOString(),
      weight:num(form.weight), waist:num(form.waist), abdomen:num(form.abdomen), hip:num(form.hip),
      bodyFat:num(form.bodyFat), muscleMass:num(form.muscleMass), visceralFat:num(form.visceralFat), notes:form.notes
    });
    setForm({weight:'',waist:'',abdomen:'',hip:'',bodyFat:'',muscleMass:'',visceralFat:'',notes:''});
    await onSaved();
  }

  return <section>
    <div className="section-title top-title"><div><span>EVOLUÇÃO</span><h1>Progresso</h1></div><Trophy size={22}/></div>
    <div className="metrics-grid">
      <Metric label="Peso atual" value={latest?.weight ? `${latest.weight.toFixed(1)} kg` : '—'} sub="último registro"/>
      <Metric label="Cintura" value={latest?.waist ? `${latest.waist.toFixed(1)} cm` : '—'} sub="último registro"/>
      <Metric label="Gordura" value={latest?.bodyFat ? `${latest.bodyFat.toFixed(1)}%` : '—'} sub="último registro"/>
      <Metric label="Registros" value={String(measures.length)} sub="neste aparelho"/>
    </div>

    <div className="panel chart-panel"><div className="panel-title"><div><span>TENDÊNCIA</span><h3>Peso</h3></div><BarChart3 size={20}/></div>{points.length>=2?<WeightChart points={points}/>:<div className="empty-inline">Registre pelo menos dois pesos para gerar o gráfico.</div>}</div>

    {baseRows.length > 0 && <div className="panel"><div className="panel-title"><div><span>DIA ZERO</span><h3>Baseline da planilha</h3></div><Database size={20}/></div><div className="baseline-grid">{baseRows.map(([label,value])=><div key={String(label)}><span>{label}</span><b>{String(value)}</b></div>)}</div></div>}

    <form className="panel measure-form" onSubmit={submit}><div className="panel-title"><div><span>NOVO REGISTRO</span><h3>Atualizar medidas</h3></div><Save size={20}/></div><div className="form-grid">{[
      ['weight','Peso (kg)'],['waist','Cintura (cm)'],['abdomen','Abdômen (cm)'],['hip','Quadril (cm)'],['bodyFat','Gordura (%)'],['muscleMass','Massa muscular (kg)'],['visceralFat','Gordura visceral']
    ].map(([key,label])=><label key={key}><span>{label}</span><input type="number" step="0.1" value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/></label>)}</div><label><span>Observações</span><textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Força, sono, fome, cardio, observações da semana..."/></label><button className="primary" type="submit"><Save size={18}/> Salvar evolução</button></form>
  </section>;
}

function WeightChart({ points }: { points: MeasureEntry[] }) {
  const vals = points.map(p=>Number(p.weight));
  const min = Math.min(...vals), max = Math.max(...vals), range = Math.max(1,max-min);
  const w=640,h=180,pad=22;
  const coords=vals.map((v,i)=>({x:pad+i/(vals.length-1)*(w-pad*2),y:pad+(max-v)/range*(h-pad*2),v}));
  const line=coords.map(c=>`${c.x},${c.y}`).join(' ');
  return <svg className="weight-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Gráfico de evolução do peso"><polyline points={line} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>{coords.map((c,i)=><g key={i}><circle cx={c.x} cy={c.y} r="5"/><text x={c.x} y={c.y-12} textAnchor="middle">{c.v.toFixed(1)}</text></g>)}</svg>;
}

function HistoryView({ sessions, person }: { sessions: WorkoutSession[]; person: PersonId }) {
  const best = new Map<string, number>();
  sessions.forEach(s=>s.exercises.forEach(ex=>ex.sets.forEach(set=>{if(set.weight!=null) best.set(ex.exerciseName,Math.max(best.get(ex.exerciseName)||0,set.weight));})));
  return <section><div className="section-title top-title"><div><span>REGISTROS</span><h1>Histórico</h1></div><History size={22}/></div>
    <div className="panel"><div className="panel-title"><div><span>RESUMO</span><h3>{people[person].name}</h3></div><Trophy size={20}/></div><div className="metrics-grid compact"><Metric label="Sessões" value={String(sessions.length)}/><Metric label="Exercícios com carga" value={String(best.size)}/></div></div>
    <div className="history-list">{sessions.length?sessions.map(s=><article className="history-card" key={s.id}><div className="history-date"><b>{new Date(s.finishedAt).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</b><span>{new Date(s.finishedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div><div className="history-main"><span>{s.dayLabel.toUpperCase()}</span><h3>{shortEmphasis(s.emphasis)}</h3><p>{s.exercises.length} exercícios • {s.completion}% concluído</p><div className="history-exercises">{s.exercises.slice(0,4).map(ex=><small key={ex.exerciseId}>{ex.exerciseName}: {ex.sets.filter(x=>x.done).length}/{ex.sets.length} séries</small>)}</div></div></article>):<div className="empty-state"><History size={34}/><h2>Nenhum treino salvo</h2><p>Finalize uma sessão para começar o histórico.</p></div>}</div>
  </section>;
}

function ProfileView({ person, onChange, onImported }: { person: PersonId; onChange: (p:PersonId)=>void; onImported:()=>Promise<void> }) {
  const nutrition = nutritionReference[person];
  const fileId = `backup-${person}`;
  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if(!f) return;
    try { await importBackup(f); await onImported(); alert('Backup restaurado com sucesso.'); }
    catch { alert('Não foi possível restaurar este arquivo.'); }
    e.target.value='';
  }
  return <section><div className="section-title top-title"><div><span>CONTA LOCAL</span><h1>Perfil</h1></div><Settings2 size={22}/></div>
    <ProfileToggle person={person} onChange={onChange}/>
    <div className="panel profile-panel"><div className={`profile-big-avatar avatar-${people[person].accent}`}>{people[person].initials}</div><h2>{people[person].name}</h2><p>{people[person].subtitle}</p><div className="profile-note"><Info size={18}/><span>Os registros ficam neste aparelho. Use backup antes de trocar de celular ou limpar os dados do navegador.</span></div></div>

    <div className="panel"><div className="panel-title"><div><span>REFERÊNCIA</span><h3>Calorias e proteína</h3></div><Activity size={20}/></div><div className="baseline-grid"><div><span>Peso de referência</span><b>{nutrition.weight} kg</b></div><div><span>Basal estimado</span><b>{Math.round(nutrition.basal)} kcal</b></div><div><span>Gasto total estimado</span><b>{Math.round(nutrition.totalMin)}–{Math.round(nutrition.totalMax)}</b></div><div><span>Faixa calórica da planilha</span><b>{Math.round(nutrition.calorieMin)}–{Math.round(nutrition.calorieMax)}</b></div>{nutrition.proteinMin!=null&&<div><span>Proteína inferior</span><b>{nutrition.proteinMin.toFixed(0)} g/dia</b></div>}</div><div className="notice"><Info size={17}/><span>{nutrition.note}</span></div></div>

    <div className="panel"><div className="panel-title"><div><span>REGRAS DO PLANO</span><h3>Orientações</h3></div><Info size={20}/></div><div className="guidance-list">{guidance.map(([title,text])=><div key={title}><b>{title}</b><p>{text}</p></div>)}</div></div>

    <div className="panel"><div className="panel-title"><div><span>SEGURANÇA DOS DADOS</span><h3>Backup</h3></div><Database size={20}/></div><button className="secondary full" onClick={exportBackup}><Download size={18}/> Exportar backup</button><label className="secondary full file-button" htmlFor={fileId}><Upload size={18}/> Restaurar backup<input id={fileId} type="file" accept="application/json" onChange={handleImport}/></label></div>
  </section>;
}

export default App;
