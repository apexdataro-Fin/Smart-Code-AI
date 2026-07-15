import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { recordAnswer, type QuizQuestion } from '@/lib/quiz';

/**
 * Single-question quiz widget with three states:
 *   - "answer"  → user has not yet revealed
 *   - "reveal"  → user has read the correct answer; can mark correct/incorrect
 *   - "scored"  → user has recorded their self-assessment
 */
export function UnitQuiz({ question }: { question: QuizQuestion }) {
  const [state, setState] = useState<'answer' | 'reveal' | 'scored'>('answer');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const reveal = () => setState('reveal');
  const rate = (r: 'correct' | 'incorrect') => {
    setResult(r);
    recordAnswer(question.id, r);
    setState('scored');
  };
  const reset = () => {
    setState('answer');
    setResult(null);
  };

  return (
    <div className="border border-secondary/30 rounded-xl overflow-hidden bg-secondary/5">
      <div className="bg-secondary/10 px-4 py-3 border-b border-secondary/30 flex items-center gap-2">
        <span aria-hidden="true">🧠</span>
        <span className="font-bold text-sm">سؤال للمراجعة النشطة</span>
      </div>
      <div className="p-4 space-y-3" dir="rtl">
        <p className="font-semibold leading-relaxed">{question.q}</p>

        {state === 'answer' && (
          <button
            type="button"
            onClick={reveal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary/40 text-secondary-foreground hover:bg-secondary/10 transition-colors text-sm"
          >
            أظهر الإجابة
          </button>
        )}

        {(state === 'reveal' || state === 'scored') && (
          <div className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed whitespace-pre-wrap border border-border">
            <span className="font-semibold text-secondary-foreground">الإجابة: </span>
            {question.a}
          </div>
        )}

        {state === 'reveal' && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => rate('correct')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              كنت محقاً
            </button>
            <button
              type="button"
              onClick={() => rate('incorrect')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4" />
              أخطأت (احفظ للمراجعة)
            </button>
          </div>
        )}

        {state === 'scored' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                result === 'correct'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
              }`}
            >
              {result === 'correct' ? 'سُجّلت كإجابة صحيحة' : 'سُجّلت للمراجعة'}
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-muted-foreground hover:bg-muted/40 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
