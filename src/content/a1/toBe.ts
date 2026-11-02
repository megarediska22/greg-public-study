import type { Lesson } from '../../types/lesson.ts';

export const toBeLesson: Lesson = {
  id: "to-be", level: "A1", title: "Глагол to be", sample: false,
  objectives: [
    "Выбирать am, is или are по местоимению.",
    "Говорить, кто вы, где находитесь, сколько вам лет и как себя чувствуете.",
    "Строить отрицания и использовать сокращения.",
    "Задавать вопросы с to be и давать короткие ответы.",
  ],
  steps: [
    { id: "intro", type: "intro", completion: "acknowledge", title: "Знакомство с уроком", description: "Что будем изучать",
      heading: "Первая фраза о себе.",
      text: "В русском мы говорим «Я студент» или «Она дома» без глагола. В английском в таких фразах нужен to be. Начнём с трёх его форм: am, is и are. Затем научимся отрицать, спрашивать и отвечать.",
      example: "I am a student. I am at home.", translation: "Я студент / студентка. Я дома." },
    { id: "theory", type: "theory", completion: "acknowledge", title: "Теория", description: "Правило и примеры",
      heading: "Кто? Где? Как себя чувствует?",
      text: `Личные местоимения заменяют имя: I — я; you — ты или вы; he — он; she — она; it — оно (о предмете, животном или погоде); we — мы; they — они. I всегда пишется с большой буквы. В обычном утверждении сначала идёт тот, о ком говорим, затем am, is или are.

To be помогает назвать человека, место, возраст или состояние: I am a student. — Я студент / студентка. She is at home. — Она дома. You are 20. — Тебе 20 лет. They are tired. — Они устали. В английском возраст выражают с to be: I am 20, а не I have 20. Перед названием профессии или словом student в единственном числе нужен a: He is a teacher. — Он учитель.

Сокращения в разговоре и письме: I am → I'm; you are → you're; he is → he's; she is → she's; it is → it's; we are → we're; they are → they're. Апостроф заменяет пропущенные буквы.

Отрицание: поставьте not сразу после to be. I am not ready. = I'm not ready. — Я не готов / не готова. She is not tired. = She isn't tired. = She's not tired. — Она не устала. We are not at home. = We aren't at home. = We're not at home. — Мы не дома. Обычного сокращения amn't нет.

Вопрос: перенесите am, is или are перед местоимением, остальные слова оставьте на месте. You are ready. → Are you ready? — Ты готов / готова? She is at home. → Is she at home? — Она дома? They are tired. → Are they tired? — Они устали?

Короткий ответ состоит из Yes/No, местоимения и формы to be: Are you happy? — Yes, I am. / No, I am not. (Ты счастлив / счастлива? — Да. / Нет.) Is she at home? — Yes, she is. / No, she isn't. (Она дома? — Да. / Нет.) В ответе на вопрос о себе you меняется на I. Утвердительную форму в конце короткого ответа не сокращаем: Yes, I am, а не Yes, I'm.

Слова для практики: ready — готовый; tired — уставший; happy — счастливый; cold — холодный; here — здесь; at home — дома; a student — студент; a teacher — учитель. It is cold. — Холодно (о погоде).`,
      tableCaption: "Местоимения, формы to be и примеры", rows: [
        { subject: "I", form: "am", example: "I am ready.", translation: "Я готов / готова." },
        { subject: "You", form: "are", example: "You are 20.", translation: "Тебе / вам 20 лет." },
        { subject: "He", form: "is", example: "He is a teacher.", translation: "Он учитель." },
        { subject: "She", form: "is", example: "She is at home.", translation: "Она дома." },
        { subject: "It", form: "is", example: "It is cold.", translation: "Холодно." },
        { subject: "We", form: "are", example: "We are here.", translation: "Мы здесь." },
        { subject: "They", form: "are", example: "They are happy.", translation: "Они счастливы." },
      ], noteTitle: "Частые ошибки",
      note: "Не пропускайте глагол: I am happy, а не I happy. Не смешивайте формы: she is, а не she are. Для вопроса меняйте порядок: Are they tired?, а не They are tired? В отрицании: I am not; в вопросе: Am I…?" },
    { id: "choice", type: "exercise", completion: "all-correct", title: "Выбор ответа", description: "Упражнение 1", questions: [
      { id: "choose-am", type: "choice", instruction: "Выберите форму глагола", prompt: "I ___ ready.", options: ["am", "is", "are"], acceptedAnswers: ["am"], explanation: "С I используется am: I am ready. — Я готов / готова." },
      { id: "to-be-teacher", type: "choice", instruction: "Выберите форму глагола: «Он учитель»", prompt: "He ___ a teacher.", options: ["are", "is", "am"], acceptedAnswers: ["is"], explanation: "С he нужна форма is: He is a teacher. — Он учитель." },
      { id: "to-be-location", type: "choice", instruction: "Выберите форму глагола: «Они дома»", prompt: "They ___ at home.", options: ["is", "am", "are"], acceptedAnswers: ["are"], explanation: "С they используется are: They are at home. — Они дома." },
      { id: "to-be-age", type: "choice", instruction: "Выберите форму глагола: «Тебе 20 лет»", prompt: "You ___ 20.", options: ["am", "are", "is"], acceptedAnswers: ["are"], explanation: "С you нужна форма are. Для возраста используем to be: You are 20. — Тебе 20 лет." },
      { id: "to-be-weather", type: "choice", instruction: "Выберите форму глагола: «Холодно»", prompt: "It ___ cold.", options: ["is", "are", "am"], acceptedAnswers: ["is"], explanation: "С it используется is: It is cold. — Холодно (о погоде)." },
    ] },
    { id: "blank", type: "exercise", completion: "all-correct", title: "Пропуски", description: "Упражнение 2", questions: [
      { id: "negative-blank", type: "blank", instruction: "Вставьте am not или сокращённую форму: «Я не готов / не готова»", prompt: "I ___ ready.", placeholder: "Введите пропущенные слова", acceptedAnswers: ["am not", "'m not"], explanation: "После I ставим am not. Можно сократить I am до I’m: I’m not ready. — Я не готов / не готова." },
      { id: "to-be-she-negative", type: "blank", instruction: "Вставьте is not или isn't: «Она не устала»", prompt: "She ___ tired.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["is not", "isn't"], explanation: "She is not tired. = She isn't tired. — Она не устала. В этом задании используйте is not или isn't." },
      { id: "to-be-we-negative", type: "blank", instruction: "Вставьте are not или aren't: «Мы не дома»", prompt: "We ___ at home.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["are not", "aren't"], explanation: "С we используется are: We are not at home. = We aren't at home. — Мы не дома." },
      { id: "to-be-he-negative", type: "blank", instruction: "Вставьте is not или isn't: «Он не учитель»", prompt: "He ___ a teacher.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["is not", "isn't"], explanation: "С he используется is. Добавьте not: He is not a teacher. = He isn't a teacher. — Он не учитель." },
      { id: "to-be-they-negative", type: "blank", instruction: "Вставьте are not или aren't: «Они не здесь»", prompt: "They ___ here.", placeholder: "Введите отрицательную форму", acceptedAnswers: ["are not", "aren't"], explanation: "С they используется are: They are not here. = They aren't here. — Они не здесь." },
    ] },
    { id: "sentence", type: "exercise", completion: "all-correct", title: "Составление фраз", description: "Упражнение 3", questions: [
      { id: "ready-question", type: "written", instruction: "Преобразуйте утверждение в вопрос, сохранив все слова", prompt: "You are ready.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Are you ready?"], explanation: "В вопросе are ставится перед you: Are you ready? — Ты готов / готова? Регистр и знак в конце не влияют на проверку." },
      { id: "to-be-student-negative", type: "written", instruction: "Сделайте предложение отрицательным; сохраните остальные слова", prompt: "I am a student.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["I am not a student.", "I'm not a student."], explanation: "Поставьте not после am: I am not a student. = I'm not a student. — Я не студент / не студентка." },
      { id: "to-be-home-negative", type: "written", instruction: "Сделайте предложение отрицательным; можно использовать сокращение", prompt: "She is at home.", placeholder: "Напишите отрицательное предложение", acceptedAnswers: ["She is not at home.", "She isn't at home.", "She's not at home."], explanation: "She is not at home. = She isn't at home. = She's not at home. — Она не дома. Все три формы допустимы." },
      { id: "to-be-tired-question", type: "written", instruction: "Преобразуйте утверждение в вопрос, сохранив все слова", prompt: "They are tired.", placeholder: "Напишите вопрос на английском", acceptedAnswers: ["Are they tired?"], explanation: "Перенесите are перед they: Are they tired? — Они устали?" },
      { id: "to-be-short-answer", type: "written", instruction: "Дайте короткий утвердительный ответ о себе: Yes, I…", prompt: "Are you happy?", placeholder: "Напишите короткий ответ", acceptedAnswers: ["Yes, I am.", "Yes I am."], explanation: "Отвечая о себе, используйте I: Yes, I am. — Да. В конце утвердительного короткого ответа am не сокращается. Запятая здесь необязательна для проверки." },
    ] },
    { id: "review", type: "review", completion: "acknowledge", title: "Разбор ошибок", description: "Объяснения и повторение" },
    { id: "summary", type: "summary", completion: "acknowledge", title: "Итоги урока", description: "Ваш следующий шаг" },
  ],
};
