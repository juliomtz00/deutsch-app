-- =============================================
-- DEUTSCH AKTIV - SUPABASE DATABASE SCHEMA
-- =============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables and loads initial vocabulary

-- =============================================
-- 1. VOCABULARY TABLE (Shared across all users)
-- =============================================
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  german TEXT NOT NULL UNIQUE,
  english TEXT NOT NULL,
  spanish TEXT NOT NULL,
  preposition TEXT,
  example TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  added_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_vocabulary_german ON vocabulary(german);
CREATE INDEX idx_vocabulary_priority ON vocabulary(priority);

-- =============================================
-- 2. PRACTICE SESSIONS TABLE (Private per user)
-- =============================================
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  confidence_rating INTEGER CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
  grammar_score INTEGER CHECK (grammar_score >= 1 AND grammar_score <= 5),
  practice_mode TEXT NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_practice_user ON practice_sessions(user_id);
CREATE INDEX idx_practice_vocab ON practice_sessions(vocabulary_id);
CREATE INDEX idx_practice_date ON practice_sessions(practiced_at);

-- =============================================
-- 3. USER STATS TABLE
-- =============================================
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_practiced INTEGER DEFAULT 0,
  unique_words_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Vocabulary: Everyone can read, authenticated users can add
CREATE POLICY "Everyone can view vocabulary"
  ON vocabulary FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add vocabulary"
  ON vocabulary FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Practice Sessions: Users can only see/manage their own
CREATE POLICY "Users can view own practice sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Stats: Users can only see/manage their own
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for vocabulary
CREATE TRIGGER update_vocabulary_updated_at
  BEFORE UPDATE ON vocabulary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_stats
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user_stats on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create stats when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 6. INSERT INITIAL VOCABULARY (240 words)
-- =============================================

INSERT INTO vocabulary (german, english, spanish, preposition, example, priority) VALUES
('das Wachstum', 'growth', 'crecimiento', '', 'Das wirtschaftliche Wachstum war bemerkenswert.', 0),
('vereinbar', 'compatible', 'compatible', 'mit + Dat', 'Beruf und Familie sind oft schwer vereinbar.', 0),
('der Wohlstand', 'prosperity', 'prosperidad', '', 'Der Wohlstand eines Landes hängt von vielen Faktoren ab.', 0),
('verzweifeln', 'to despair', 'desesperarse', 'an + Dat', 'Man sollte nicht an dieser Aufgabe verzweifeln.', 0),
('verschwenden', 'to waste', 'desperdiciar', '', 'Man sollte keine Ressourcen verschwenden.', 0),
('vertauschen', 'to swap', 'intercambiar', '', 'Die Zwillinge haben ihre Jacken vertauscht.', 0),
('unterschätzen', 'to underestimate', 'subestimar', '', 'Man sollte die Schwierigkeit nicht unterschätzen.', 0),
('verlangen', 'to demand', 'exigir', '', 'Diese Aufgabe verlangt viel Konzentration.', 0),
('schwach', 'weak', 'débil', '', 'Nach der Krankheit fühlte er sich noch schwach.', 0),
('kaum', 'hardly', 'apenas', '', 'Kaum jemand hat diese Chance genutzt.', 0),
('die Bewertung', 'assessment', 'evaluación', '', 'Die Bewertung der Arbeit erfolgt nach klaren Kriterien.', 0),
('der Begriff', 'concept', 'concepto', '', 'Dieser Begriff ist schwer zu definieren.', 0),
('die Quelle', 'source', 'fuente', '', 'Die Quelle des Problems muss gefunden werden.', 0),
('das Ereignis', 'event', 'acontecimiento', '', 'Dieses Ereignis hatte große Auswirkungen.', 0),
('verwalten', 'to administer', 'administrar', '', 'Die Universität verwaltet die Studentendaten.', 0),
('zugreifen', 'to access', 'acceder', 'auf + Akk', 'Man kann auf die Daten online zugreifen.', 0),
('forschen', 'to research', 'investigar', 'an + Dat', 'Wissenschaftler forschen an neuen Methoden.', 0),
('die Bewegung', 'movement', 'movimiento', '', 'Die Bewegung für Klimaschutz wächst.', 0),
('bewegen', 'to move', 'mover', 'zu + Dat', 'Diese Argumente können die Leute bewegen.', 0),
('die Werbung', 'advertisement', 'publicidad', 'für + Akk', 'Die Werbung erreicht viele Menschen.', 0),
('auslassen', 'to leave out', 'omitir', '', 'Man sollte keine wichtigen Details auslassen.', 0),
('die Verwaltung', 'administration', 'administración', '', 'Die Verwaltung ist für die Organisation zuständig.', 0),
('die Aufmerksamkeit', 'attention', 'atención', '', 'Diese Präsentation erfordert volle Aufmerksamkeit.', 0),
('entnehmen', 'to extract', 'extraer', 'aus + Dat', 'Dem Text kann man wichtige Informationen entnehmen.', 0),
('sobald', 'as soon as', 'tan pronto como', '', 'Sobald die Ergebnisse vorliegen, können wir entscheiden.', 0),
('bald', 'soon', 'pronto', '', 'Wir treffen uns bald.', 0),
('anbieten', 'to offer', 'ofrecer', '', 'Die Universität kann verschiedene Kurse anbieten.', 0),
('zumindest', 'at least', 'al menos', '', 'Zumindest 50% der Studenten haben teilgenommen.', 0),
('empfinden', 'to feel', 'sentir', 'als + Akk', 'Viele Menschen empfinden Stress bei der Arbeit.', 0),
('ziemlich', 'quite', 'bastante', '', 'Die Aufgabe war ziemlich schwierig.', 0),
('das Wesen', 'essence', 'esencia', '', 'Das Wesen der Demokratie ist die Freiheit.', 0),
('zwingen', 'to force', 'forzar', 'zu + Dat', 'Niemand sollte zu etwas gezwungen werden.', 0),
('furchtbar', 'terrible', 'terrible', '', 'Der Verkehr war furchtbar.', 0),
('schmal', 'narrow', 'estrecho', '', 'Die Straße ist sehr schmal.', 0),
('abbiegen', 'to turn', 'doblar', '', 'An der Kreuzung muss man links abbiegen.', 0),
('verteilen', 'to distribute', 'distribuir', '', 'Die Aufgaben wurden gleichmäßig verteilt.', 0),
('fehlen', 'to be missing', 'faltar', 'Dat', 'Mir fehlen die richtigen Worte.', 0),
('vermeiden', 'to avoid', 'evitar', '', 'Man sollte Missverständnisse vermeiden.', 0),
('besonders', 'especially', 'especialmente', '', 'Besonders in großen Städten ist die Luftverschmutzung hoch.', 0),
('umfassen', 'to comprise', 'comprender', '', 'Die Studie umfasst 500 Teilnehmer.', 0),
('sich unterhalten', 'to converse', 'conversar', 'über + Akk', 'Wir unterhalten uns über verschiedene Themen.', 0),
('berichten', 'to report', 'reportar', 'über + Akk', 'Die Medien berichten täglich über Politik.', 0),
('insbesondere', 'in particular', 'en particular', '', 'Insbesondere junge Menschen sind betroffen.', 0),
('die Einleitung', 'introduction', 'introducción', '', 'Die Einleitung erklärt das Thema.', 0),
('vorbei', 'over', 'terminado', '', 'Die Zeit ist vorbei.', 0),
('eher', 'rather', 'más bien', '', 'Ich komme eher morgen als übermorgen.', 0),
('einsam', 'lonely', 'solitario', '', 'Viele alte Menschen fühlen sich einsam.', 0),
('ehrlich', 'honest', 'honesto', '', 'Man sollte immer ehrlich sein.', 0),
('die Vorliebe', 'preference', 'preferencia', 'für + Akk', 'Jeder Mensch hat persönliche Vorlieben.', 0),
('die Abneigung', 'aversion', 'aversión', 'gegen + Akk', 'Wir alle haben bestimmte Abneigungen.', 0),
('sich ausruhen', 'to rest', 'descansar', '', 'Nach der Arbeit sollte man sich ausruhen.', 0),
('besichtigen', 'to visit', 'visitar', '', 'Touristen besichtigen gerne die Sehenswürdigkeiten.', 0),
('ausschlafen', 'to sleep in', 'dormir hasta tarde', '', 'Am Wochenende möchte ich ausschlafen.', 0),
('führen', 'to lead', 'conducir', 'zu + Dat', 'Gute Kommunikation kann zu Erfolg führen.', 0),
('sich überlegen', 'to consider', 'considerar', '', 'Man sollte sich die Entscheidung gut überlegen.', 0),
('bügeln', 'to iron', 'planchar', '', 'Ich muss noch die Hemden bügeln.', 0),
('sich erholen', 'to recover', 'recuperarse', '', 'Im Urlaub kann man sich gut erholen.', 0),
('abwaschen', 'to wash up', 'lavar', '', 'Nach dem Essen muss man das Geschirr abwaschen.', 0),
('ausgehen', 'to go out', 'salir', '', 'Am Abend möchten wir ausgehen.', 0),
('faulenzen', 'to laze', 'holgazanear', '', 'Am Sonntag will ich nur faulenzen.', 0),
('vorhaben', 'to plan', 'planear', '', 'Was haben Sie für nächste Woche vor?', 0),
('rechtzeitig', 'on time', 'a tiempo', '', 'Bitte kommen Sie rechtzeitig.', 0),
('der Schutz', 'protection', 'protección', '', 'Der Schutz der Umwelt ist wichtig.', 0),
('giftig', 'toxic', 'tóxico', '', 'Einige Chemikalien sind giftig.', 0),
('betreuen', 'to care for', 'cuidar', '', 'Sozialarbeiter betreuen benachteiligte Familien.', 0),
('überqueren', 'to cross', 'cruzar', '', 'Fußgänger sollten die Straße nur am Zebrastreifen überqueren.', 0),
('die Reihe', 'row', 'fila', '', 'Bitte stellen Sie sich in eine Reihe.', 0),
('sich bedanken', 'to thank', 'agradecer', 'bei + Dat', 'Ich möchte mich für die Hilfe bedanken.', 0),
('erschrecken', 'to frighten', 'asustarse', '', 'Der laute Knall hat mich erschreckt.', 0),
('verhaften', 'to arrest', 'arrestar', '', 'Die Polizei konnte den Verdächtigen verhaften.', 0),
('erleichtert', 'relieved', 'aliviado', '', 'Ich bin erleichtert, dass alles gut ging.', 0),
('der Gegensatz', 'contrast', 'contraste', 'zu + Dat', 'Der Gegensatz zwischen arm und reich wächst.', 0),
('eben', 'exactly', 'exactamente', '', 'Das ist eben das Problem.', 0),
('die Träne', 'tear', 'lágrima', '', 'Die Träne rollte über ihre Wange.', 0),
('retten', 'to rescue', 'rescatar', '', 'Die Feuerwehr konnte die Menschen retten.', 0),
('schweben', 'to float', 'flotar', '', 'Der Ballon schwebt in der Luft.', 0),
('vermutlich', 'presumably', 'presumiblemente', '', 'Vermutlich wird es morgen regnen.', 0),
('übertragen', 'to transmit', 'transmitir', '', 'Die Krankheit kann übertragen werden.', 0),
('sich auseinandersetzen', 'to deal with', 'ocuparse de', 'mit + Dat', 'Man muss sich mit dem Thema auseinandersetzen.', 0),
('ansteigen', 'to rise', 'aumentar', '', 'Die Temperaturen steigen im Sommer an.', 0),
('vermitteln', 'to convey', 'transmitir', '', 'Lehrer vermitteln Wissen an Schüler.', 0),
('erarbeiten', 'to work out', 'elaborar', '', 'Gemeinsam können wir Lösungen erarbeiten.', 0),
('äußern', 'to express', 'expresar', '', 'Die Teilnehmer können ihre Meinung äußern.', 0),
('ermöglichen', 'to enable', 'posibilitar', '', 'Technologie kann neue Möglichkeiten ermöglichen.', 0),
('wahr', 'true', 'verdadero', '', 'Die Geschichte ist wahr.', 0),
('stattfinden', 'to take place', 'tener lugar', '', 'Die Konferenz wird morgen stattfinden.', 0),
('dicht', 'dense', 'denso', '', 'Der Nebel ist sehr dicht.', 0),
('die Leistung', 'performance', 'rendimiento', '', 'Die Leistung des Computers ist beeindruckend.', 0),
('erfüllen', 'to fulfill', 'cumplir', '', 'Die Bedingungen müssen erfüllt werden.', 0),
('ursprünglich', 'original', 'original', '', 'Der ursprüngliche Plan wurde geändert.', 0),
('die Verwendung', 'use', 'uso', '', 'Die Verwendung dieses Werkzeugs ist vielfältig.', 0),
('zunehmen', 'to increase', 'aumentar', '', 'Die Bevölkerung wird weiter zunehmen.', 0),
('der Wert', 'value', 'valor', '', 'Der Wert dieser Information ist hoch.', 0),
('häufig', 'frequent', 'frecuente', '', 'Dieses Problem tritt häufig auf.', 0),
('der Kern', 'core', 'núcleo', '', 'Der Kern des Arguments ist wichtig.', 0),
('der Wandel', 'change', 'cambio', '', 'Der gesellschaftliche Wandel ist unvermeidlich.', 0),
('umfassend', 'comprehensive', 'integral', '', 'Eine umfassende Lösung ist erforderlich.', 0),
('stabil', 'stable', 'estable', '', 'Das System muss stabil sein.', 0),
('sich anpassen', 'to adapt', 'adaptarse', 'an + Akk', 'Ich muss mich an die neue Kultur anpassen.', 0),
('bezeichnend', 'characteristic', 'característico', 'für + Akk', 'Das ist bezeichnend für seine Arbeitsweise.', 0),
('nämlich', 'namely', 'es decir', '', 'Er kommt nicht, er ist nämlich krank.', 0),
('abschließen', 'to conclude', 'concluir', '', 'Wir müssen das Projekt bald abschließen.', 0),
('sich anziehen', 'to get dressed', 'vestirse', '', 'Ich muss mich warm anziehen.', 0),
('auffallen', 'to stand out', 'destacar', '', 'Das neue Design wird sicher auffallen.', 0),
('aufgeben', 'to give up', 'rendirse', '', 'Man sollte nicht so schnell aufgeben.', 0),
('ausgeben', 'to spend', 'gastar', 'für + Akk', 'Die Regierung gibt viel Geld für Bildung aus.', 0),
('aussehen', 'to look', 'parecer', '', 'Das sieht sehr interessant aus.', 0),
('aussteigen', 'to get off', 'bajarse', '', 'An der nächsten Station muss ich aussteigen.', 0),
('beraten', 'to advise', 'aconsejar', '', 'Experten beraten die Kunden.', 0),
('besitzen', 'to own', 'poseer', '', 'Er besitzt ein großes Vermögen.', 0),
('bestehen', 'to consist', 'consistir', 'aus + Dat', 'Die Prüfung besteht aus drei Teilen.', 0),
('beweisen', 'to prove', 'probar', '', 'Man muss seine Qualifikation beweisen.', 0),
('bieten', 'to offer', 'ofrecer', '', 'Die Situation bietet viele Möglichkeiten.', 0),
('bitten', 'to ask', 'pedir', 'um + Akk', 'Ich muss dich um einen Gefallen bitten.', 0),
('entstehen', 'to arise', 'surgir', '', 'Dadurch können Probleme entstehen.', 0),
('erfinden', 'to invent', 'inventar', '', 'Er hat das Telefon erfunden.', 0),
('fliehen', 'to flee', 'huir', 'vor + Dat', 'Die Bewohner mussten vor dem Krieg fliehen.', 0),
('gelten', 'to apply', 'valer', 'für + Akk', 'Diese Regel gilt für alle.', 0),
('genießen', 'to enjoy', 'disfrutar', '', 'Wir sollten die freie Zeit genießen.', 0),
('halten', 'to hold', 'sostener', 'von + Dat', 'Was halten Sie von diesem Vorschlag?', 0),
('leihen', 'to lend', 'prestar', '', 'Kann ich mir dein Auto leihen?', 0),
('nennen', 'to name', 'nombrar', '', 'Man kann das Problem unterschiedlich nennen.', 0),
('scheinen', 'to seem', 'parecer', '', 'Die Sonne scheint heute hell.', 0),
('sterben', 'to die', 'morir', 'an + Dat', 'Viele Menschen sterben an dieser Krankheit.', 0),
('sich treffen', 'to meet', 'encontrarse', '', 'Wir treffen uns morgen um 10 Uhr.', 0),
('unternehmen', 'to undertake', 'emprender', '', 'Die Firma wird ein neues Projekt unternehmen.', 0),
('sich unterscheiden', 'to differ', 'diferenciarse', '', 'Die Kulturen unterscheiden sich stark.', 0),
('verbringen', 'to spend time', 'pasar', '', 'Wir verbringen den Urlaub am Meer.', 0),
('verschieben', 'to postpone', 'posponer', '', 'Wir müssen das Treffen verschieben.', 0),
('versprechen', 'to promise', 'prometer', 'Dat', 'Ich verspreche dir, pünktlich zu sein.', 0),
('sich vornehmen', 'to intend', 'proponerse', '', 'Ich nehme mir vor, mehr zu lernen.', 0),
('vorschlagen', 'to suggest', 'proponer', '', 'Darf ich etwas vorschlagen?', 0),
('wachsen', 'to grow', 'crecer', '', 'Die Pflanzen wachsen schnell.', 0),
('werben', 'to advertise', 'anunciar', 'für + Akk', 'Die Firma wirbt für neue Produkte.', 0),
('widersprechen', 'to contradict', 'contradecir', 'Dat', 'Ich muss dir widersprechen.', 0),
('zurechtkommen', 'to cope', 'arreglárselas', 'mit + Dat', 'Ich komme in der neuen Stadt gut zurecht.', 0),
('achten', 'to pay attention', 'prestar atención', 'auf + Akk', 'Man sollte auf die Umwelt achten.', 0),
('sich ärgern', 'to get annoyed', 'enfadarse', 'über + Akk', 'Ich ärgere mich über den Lärm.', 0),
('sich beschweren', 'to complain', 'quejarse', 'über + Akk', 'Kunden beschweren sich oft über die Preise.', 0),
('eingehen', 'to address', 'tratar', 'auf + Akk', 'Wir sollten auf das Angebot eingehen.', 0),
('sich einsetzen', 'to commit', 'comprometerse', 'für + Akk', 'Man sollte sich für die Umwelt einsetzen.', 0),
('sich engagieren', 'to be involved', 'comprometerse', '', 'Viele engagieren sich ehrenamtlich.', 0),
('sich gewöhnen', 'to get used to', 'acostumbrarse', 'an + Akk', 'Man muss sich an das Klima gewöhnen.', 0),
('sich handeln', 'to be about', 'tratarse de', 'um + Akk', 'Es handelt sich um ein wichtiges Thema.', 0),
('hinweisen', 'to point out', 'señalar', 'auf + Akk', 'Ich möchte auf ein Problem hinweisen.', 0),
('kämpfen', 'to fight', 'luchar', 'für + Akk', 'Aktivisten kämpfen für ihre Rechte.', 0),
('reagieren', 'to react', 'reaccionar', 'auf + Akk', 'Wie reagierst du auf die Kritik?', 0),
('sich verlassen', 'to rely on', 'confiar en', 'auf + Akk', 'Man kann sich auf seine Freunde verlassen.', 0),
('verzichten', 'to give up', 'renunciar', 'auf + Akk', 'Ich muss auf Zucker verzichten.', 0),
('sich wenden', 'to turn to', 'dirigirse a', 'an + Akk', 'Man sollte sich an einen Experten wenden.', 0),
('sich wundern', 'to wonder', 'sorprenderse', 'über + Akk', 'Ich wundere mich über seine Reaktion.', 0),
('abhängen', 'to depend on', 'depender', 'von + Dat', 'Das Ergebnis hängt von vielen Faktoren ab.', 0),
('abraten', 'to advise against', 'desaconsejar', 'von + Dat', 'Ich muss dir von dieser Idee abraten.', 0),
('ändern', 'to change', 'cambiar', '', 'Wir müssen unsere Pläne ändern.', 0),
('sich austauschen', 'to exchange', 'intercambiar', 'über + Akk', 'Experten tauschen sich regelmäßig aus.', 0),
('sich befassen', 'to deal with', 'ocuparse de', 'mit + Dat', 'Wissenschaftler befassen sich mit diesem Thema.', 0),
('sich befinden', 'to be located', 'encontrarse', '', 'Das Gebäude befindet sich im Zentrum.', 0),
('beitragen', 'to contribute', 'contribuir', 'zu + Dat', 'Das trägt zur Lösung bei.', 0),
('sich beteiligen', 'to participate', 'participar', 'an + Dat', 'Alle können sich an der Diskussion beteiligen.', 0),
('sich entschließen', 'to decide', 'decidirse', 'zu + Dat', 'Ich habe mich entschlossen, zu kündigen.', 0),
('erkennen', 'to recognize', 'reconocer', '', 'Man kann das Problem schnell erkennen.', 0),
('sich erkundigen', 'to inquire', 'informarse', 'nach + Dat', 'Ich möchte mich nach dem Weg erkundigen.', 0),
('erziehen', 'to raise', 'educar', '', 'Eltern erziehen ihre Kinder.', 0),
('gehören', 'to belong', 'pertenecer', 'Dat', 'Das Buch gehört mir.', 0),
('klarkommen', 'to cope', 'arreglárselas', 'mit + Dat', 'Ich komme mit der Situation gut klar.', 0),
('leiden', 'to suffer', 'sufrir', 'an + Dat', 'Viele Menschen leiden an dieser Krankheit.', 0),
('nachfragen', 'to ask', 'preguntar', '', 'Bei Unklarheiten sollte man nachfragen.', 0),
('träumen', 'to dream', 'soñar', 'von + Dat', 'Ich träume von einer besseren Welt.', 0),
('überzeugen', 'to convince', 'convencer', '', 'Gute Argumente können überzeugen.', 0),
('umgehen', 'to handle', 'manejar', 'mit + Dat', 'Man sollte vorsichtig mit Chemikalien umgehen.', 0),
('unterstützen', 'to support', 'apoyar', '', 'Familie und Freunde unterstützen ihn.', 0),
('sich verabschieden', 'to say goodbye', 'despedirse', '', 'Ich muss mich jetzt verabschieden.', 0),
('plötzlich', 'suddenly', 'de repente', '', 'Plötzlich fing es an zu regnen.', 0),
('beeinflussen', 'to influence', 'influir', '', 'Viele Faktoren beeinflussen die Entscheidung.', 0),
('beruhen', 'to be based on', 'basarse en', 'auf + Dat', 'Die Theorie beruht auf wissenschaftlichen Erkenntnissen.', 0),
('sich konzentrieren', 'to concentrate', 'concentrarse', 'auf + Akk', 'Ich muss mich auf die Prüfung konzentrieren.', 0),
('eintauchen', 'to immerse', 'sumergir', 'in + Akk', 'Ich will mich im Sommer im Wasser eintauchen.', 0),
('sich Sorgen machen', 'to worry', 'preocuparse', 'um + Akk', 'Ich mache mir Sorgen um die Gesundheit meiner Eltern.', 0);

-- =============================================
-- 7. HELPFUL QUERIES (for reference)
-- =============================================

-- Get user's practice stats
-- SELECT * FROM user_stats WHERE user_id = auth.uid();

-- Get user's recent practice sessions
-- SELECT ps.*, v.german, v.english 
-- FROM practice_sessions ps
-- JOIN vocabulary v ON v.id = ps.vocabulary_id
-- WHERE ps.user_id = auth.uid()
-- ORDER BY ps.practiced_at DESC
-- LIMIT 20;

-- Get vocabulary with practice count
-- SELECT v.*, COUNT(ps.id) as practice_count
-- FROM vocabulary v
-- LEFT JOIN practice_sessions ps ON ps.vocabulary_id = v.id AND ps.user_id = auth.uid()
-- GROUP BY v.id
-- ORDER BY practice_count DESC;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- Next steps:
-- 1. Copy your Supabase URL and anon key to .env.local
-- 2. Run this SQL in your Supabase SQL Editor
-- 3. Start your Next.js app: npm run dev
-- =============================================
