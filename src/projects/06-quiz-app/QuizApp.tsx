import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, PlusCircle, Trash2, Users, BarChart3, BookOpen, Clock, Play } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  timeLimitMinutes: number;
  questions: Question[];
  stats: {
    totalAttempts: number;
    averageScore: number;
  };
}

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'React & Vite Fundamentals',
    timeLimitMinutes: 5,
    questions: [
      {
        id: 1,
        question: 'What hook is used to manage state in a functional React component?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'Which build tool is known for lightning-fast HMR and used in miles-lab?',
        options: ['Webpack', 'Parcel', 'Vite', 'Gulp'],
        correctAnswer: 2,
      },
    ],
    stats: { totalAttempts: 14, averageScore: 85 }
  }
];

export default function QuizApp() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  
  // Student taking state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Teacher Creation State
  const [quizTitle, setQuizTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('5');
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [currentDraftQuestions, setCurrentDraftQuestions] = useState<Question[]>([]);

  // Add question to teacher draft
  const handleAddDraftQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !opt1 || !opt2) return;

    const newQ: Question = {
      id: Date.now(),
      question: qText.trim(),
      options: [opt1, opt2, opt3 || 'N/A', opt4 || 'N/A'].filter(Boolean),
      correctAnswer: Number(correctIdx),
    };

    setCurrentDraftQuestions([...currentDraftQuestions, newQ]);
    setQText('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setCorrectIdx(0);
  };

  // Save Quiz to platform
  const handleSaveQuiz = () => {
    if (!quizTitle.trim() || currentDraftQuestions.length === 0) return;

    const newQuiz: Quiz = {
      id: 'quiz_' + Date.now(),
      title: quizTitle.trim(),
      timeLimitMinutes: Number(timeLimit) || 5,
      questions: currentDraftQuestions,
      stats: { totalAttempts: 0, averageScore: 0 }
    };

    setQuizzes([...quizzes, newQuiz]);
    setQuizTitle('');
    setCurrentDraftQuestions([]);
    setActiveTab('student');
  };

  // Start taking a quiz
  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsSubmitted(false);
    setQuizFinished(false);
  };

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleNextOrSubmit = () => {
    if (selectedOption === null || !selectedQuiz) return;

    if (!isSubmitted) {
      setIsSubmitted(true);
      if (selectedOption === selectedQuiz.questions[currentIndex].correctAnswer) {
        setScore(prev => prev + 1);
      }
    } else {
      if (currentIndex < selectedQuiz.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        setQuizFinished(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Top Navbar: Switcher */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
              06. Miles Quiz LMS Portal
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('student'); setSelectedQuiz(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Student Hub
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'teacher' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Teacher Panel
            </button>
          </div>
        </div>

        {/* ================= STUDENT HUB ================= */}
        {activeTab === 'student' && !selectedQuiz && (
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Available Quizzes</h3>
            <div className="grid grid-cols-1 gap-3">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{quiz.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> {quiz.questions.length} Questions</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {quiz.timeLimitMinutes} mins</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <Play className="w-3.5 h-3.5" /> Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STUDENT TAKING QUIZ ================= */}
        {activeTab === 'student' && selectedQuiz && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-indigo-400 uppercase">{selectedQuiz.title}</span>
              {!quizFinished && (
                <span className="text-xs text-slate-400 font-mono">Question {currentIndex + 1} of {selectedQuiz.questions.length}</span>
              )}
            </div>

            {!quizFinished ? (
              <div>
                <h3 className="text-base font-bold text-white mb-6 leading-relaxed">
                  {selectedQuiz.questions[currentIndex].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {selectedQuiz.questions[currentIndex].options.map((option, index) => {
                    let optionStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';
                    const correctIdx = selectedQuiz.questions[currentIndex].correctAnswer;

                    if (isSubmitted) {
                      if (index === correctIdx) {
                        optionStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                      } else if (index === selectedOption) {
                        optionStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                      }
                    } else if (selectedOption === index) {
                      optionStyle = 'bg-indigo-600/20 border-indigo-500 text-white';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {isSubmitted && index === correctIdx && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isSubmitted && index === selectedOption && index !== correctIdx && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextOrSubmit}
                  disabled={selectedOption === null}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                  {!isSubmitted ? 'Submit Answer' : currentIndex < selectedQuiz.questions.length - 1 ? 'Next Question' : 'View Results'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Quiz Completed!</h3>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full mb-6 shadow-inner mt-4">
                  <div className="text-4xl font-black font-mono text-indigo-400 mb-1">
                    {score} / {selectedQuiz.questions.length}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Final Score</div>
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Back to Quizzes
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TEACHER PANEL ================= */}
        {activeTab === 'teacher' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Statistics Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Hosted Quizzes</div>
                <div className="text-2xl font-mono font-bold text-indigo-400">{quizzes.length}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Active Students Enrolled</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">42</div>
              </div>
            </div>

            {/* Quiz Creator */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" /> Create & Host New Quiz
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Advanced TypeScript"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <form onSubmit={handleAddDraftQuestion} className="space-y-3 pt-2 border-t border-slate-900">
                <div className="text-xs font-bold text-indigo-300">Add Questions to Quiz ({currentDraftQuestions.length} Added)</div>
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Question prompt..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={opt1} onChange={(e) => setOpt1(e.target.value)} placeholder="Option 1" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
                  <input type="text" value={opt2} onChange={(e) => setOpt2(e.target.value)} placeholder="Option 2" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
                  <input type="text" value={opt3} onChange={(e) => setOpt3(e.target.value)} placeholder="Option 3 (Optional)" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
                  <input type="text" value={opt4} onChange={(e) => setOpt4(e.target.value)} placeholder="Option 4 (Optional)" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Correct Option Index (0-3):</span>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={correctIdx}
                      onChange={(e) => setCorrectIdx(Number(e.target.value))}
                      className="w-14 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center font-mono text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    + Add Question
                  </button>
                </div>
              </form>

              {currentDraftQuestions.length > 0 && (
                <button
                  onClick={handleSaveQuiz}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer uppercase tracking-wider mt-4"
                >
                  Publish Quiz to Student Hub
                </button>
              )}
            </div>

            {/* Hosted Quizzes Management */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Hosted Quizzes Management
              </h3>
              <div className="space-y-2">
                {quizzes.map(q => (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{q.title}</div>
                      <div className="text-[10px] text-slate-400">{q.questions.length} Questions | {q.timeLimitMinutes} min limit</div>
                    </div>
                    <button
                      onClick={() => setQuizzes(quizzes.filter(item => item.id !== q.id))}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span>Teacher & Student LMS</span>
          <span className="font-mono">React State Management</span>
        </div>

      </div>
    </div>
  );
}