import type { CourseEntry } from '../types/lesson';
import { toBeLesson } from './a1/toBe.ts';
import { presentSimpleLesson } from './a1/presentSimple.ts';
import { doDoesLesson } from './a1/doDoes.ts';
import { haveHasLesson } from './a1/haveHas.ts';
import { articlesLesson } from './a1/articles.ts';
import { demonstrativesLesson } from './a1/demonstratives.ts';
import { thereIsAreLesson } from './a1/thereIsAre.ts';
import { canCantLesson } from './a1/canCant.ts';
import { presentContinuousLesson } from './a1/presentContinuous.ts';
import { wasWereLesson } from './a1/wasWere.ts';
import { questionTasks } from './questionTasks.ts';
import { validateTaskIndicators } from '../lib/taskIndicators.ts';
import { validateCourse } from '../lib/validation.ts';

import { peopleFeelingsLesson } from './vocabulary/peopleFeelings.ts';
import { dailyRoutinesLesson } from './vocabulary/dailyRoutines.ts';
import { familyObjectsLesson } from './vocabulary/familyObjects.ts';
import { homePlacesLesson } from './vocabulary/homePlaces.ts';
import { hobbiesAbilitiesLesson } from './vocabulary/hobbiesAbilities.ts';
import { actionsTimeLesson } from './vocabulary/actionsTime.ts';

import { greetingsReactionsLesson } from './practical/greetingsReactions.ts';
import { everydayCombinationsLesson } from './practical/everydayCombinations.ts';
import { helpAndCafeLesson } from './practical/helpAndCafe.ts';
import { simpleArrangementsLesson } from './practical/simpleArrangements.ts';
import { smallTalkBasicsLesson } from './practical/smallTalkBasics.ts';

// Catalog order defines prerequisites. Missing content is never treated as complete.
export const grammarLessons: readonly CourseEntry[] = [
  { id: 'to-be', title: 'Глагол to be', subtitle: 'am / is / are', objective: 'Расскажите, кто вы, где находитесь и как себя чувствуете.', lesson: toBeLesson },
  { id: 'present-simple', title: 'Present Simple', subtitle: 'Утверждения и отрицания', objective: 'Говорите о привычках и повседневных делах.', lesson: presentSimpleLesson },
  { id: 'do-does', title: 'Вопросы в Present Simple', subtitle: 'do / does', objective: 'Задавайте вопросы и отвечайте коротко.', lesson: doDoesLesson },
  { id: 'have-has', title: 'Что у нас есть', subtitle: 'have / has', objective: 'Расскажите о вещах и спросите, что есть у других.', lesson: haveHasLesson },
  { id: 'articles', title: 'Артикли', subtitle: 'a / an / the', objective: 'Различайте любой предмет и тот самый.', lesson: articlesLesson },
  { id: 'demonstratives', title: 'Это или то?', subtitle: 'this / that / these / those', objective: 'Показывайте на один или несколько предметов рядом и вдали.', lesson: demonstrativesLesson },
  { id: 'there-is-are', title: 'Что вокруг', subtitle: 'there is / there are', objective: 'Опишите комнату и узнайте, что в ней есть.', lesson: thereIsAreLesson },
  { id: 'can-cant', title: 'Что мы умеем', subtitle: 'can / can’t', objective: 'Говорите об умениях и возможностях.', lesson: canCantLesson },
  { id: 'present-continuous', title: 'Прямо сейчас', subtitle: 'Present Continuous', objective: 'Расскажите о действиях, которые происходят сейчас.', lesson: presentContinuousLesson },
  { id: 'was-were', title: 'Что было вчера', subtitle: 'was / were', objective: 'Расскажите, где вы были и как себя чувствовали в прошлом.', lesson: wasWereLesson },
];

const vocabularyEntries: readonly CourseEntry[] = [
  { id: 'people-feelings', title: 'Люди и чувства', subtitle: 'People & Feelings', objective: 'Назовите людей и расскажите о своём настроении.', lesson: peopleFeelingsLesson },
  { id: 'daily-routines', title: 'Каждый день', subtitle: 'Daily Routines & Common Verbs', objective: 'Расскажите о привычном дне — от подъёма до сна.', lesson: dailyRoutinesLesson },
  { id: 'family-objects', title: 'Семья и вещи рядом', subtitle: 'Family & Everyday Objects', objective: 'Назовите близких и знакомые вещи.', lesson: familyObjectsLesson },
  { id: 'home-places', title: 'Дом и места вокруг', subtitle: 'Home & Places', objective: 'Опишите комнаты и места рядом с домом.', lesson: homePlacesLesson },
  { id: 'hobbies-abilities', title: 'Хобби и умения', subtitle: 'Hobbies & Abilities', objective: 'Расскажите, что вы умеете делать.', lesson: hobbiesAbilitiesLesson },
  { id: 'actions-time', title: 'Действия и время', subtitle: 'Actions & Time Expressions', objective: 'Различайте привычки и действия прямо сейчас.', lesson: actionsTimeLesson },
];

const entriesById = new Map([...grammarLessons, ...vocabularyEntries].map(entry => [entry.id, entry]));
export const foundationLessons: readonly CourseEntry[] = [
  'to-be', 'people-feelings', 'present-simple', 'do-does',
  'daily-routines', 'have-has', 'articles', 'family-objects',
  'demonstratives', 'there-is-are', 'home-places', 'can-cant',
  'hobbies-abilities', 'present-continuous', 'actions-time', 'was-were',
].map(id => {
  const entry = entriesById.get(id);
  if (!entry) throw new Error(`Missing course entry: ${id}`);
  return entry;
});

export const practicalLessons: readonly CourseEntry[] = [
  { id: 'greetings-reactions', title: 'Приветствия и реакции', subtitle: 'Greetings & Reactions', objective: 'Поздоровайтесь, отреагируйте на новость и попрощайтесь.', lesson: greetingsReactionsLesson },
  { id: 'everyday-combinations', title: 'Полезные сочетания глаголов', subtitle: 'Everyday Verb Combinations', objective: 'Говорите об учёбе и отдыхе привычными сочетаниями.', lesson: everydayCombinationsLesson },
  { id: 'help-and-cafe', title: 'Просьбы, помощь и кафе', subtitle: 'Help, Clarification & Café', objective: 'Попросите помощи, уточните непонятное и закажите кофе.', lesson: helpAndCafeLesson },
  { id: 'simple-arrangements', title: 'Простые договорённости', subtitle: 'Making Simple Plans', objective: 'Пригласите друга и договоритесь об удобном времени.', lesson: simpleArrangementsLesson },
  { id: 'small-talk-basics', title: 'Короткая беседа', subtitle: 'Small Talk Basics', objective: 'Поддержите разговор и вежливо завершите его.', lesson: smallTalkBasicsLesson },
];

// Preserve the published 16-lesson prefix: no new prerequisite is inserted.
export const lessons: readonly CourseEntry[] = [...foundationLessons, ...practicalLessons];

validateCourse(lessons);
validateTaskIndicators(lessons, questionTasks);

export const questionCount = lessons.reduce((total, entry) => total + (entry.lesson?.steps.reduce((count, step) => count + (step.type === 'exercise' ? step.questions.length : 0), 0) ?? 0), 0);
