export interface QuizQuestion {
  question: string;
  type: "multiple-choice" | "true-false" | "code";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  code?: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export default {
  title: "What is D3.js Quiz",
  questions: [
    {
      question: "What does D3 stand for?",
      type: "multiple-choice",
      options: [
        "Data-Driven Documents",
        "Dynamic Data Display",
        "Document Data Design",
        "Direct Data Deployment",
      ],
      correctAnswer: 0,
      explanation:
        "D3 stands for Data-Driven Documents, emphasizing how data drives the creation and manipulation of documents.",
    },
    {
      question: "D3.js can only create bar charts and line graphs.",
      type: "true-false",
      correctAnswer: "false",
      explanation:
        "D3.js is extremely flexible and can create virtually any type of visualization, not just bar charts and line graphs.",
    },
    {
      question:
        "Which technology does D3.js primarily use for rendering visualizations?",
      type: "multiple-choice",
      options: [
        "Canvas API",
        "WebGL",
        "SVG (Scalable Vector Graphics)",
        "Flash",
      ],
      correctAnswer: 2,
      explanation:
        "While D3 can work with various technologies, it primarily uses SVG for creating scalable, interactive visualizations.",
    },
    {
      question:
        "What is the main advantage of using D3.js over other charting libraries?",
      type: "multiple-choice",
      options: [
        "It's easier to learn",
        "It provides pre-built chart templates",
        "It gives complete control over the visualization",
        "It requires no JavaScript knowledge",
      ],
      correctAnswer: 2,
      explanation:
        "D3's main advantage is the complete control it provides over every aspect of the visualization, though this comes with a steeper learning curve.",
    },
  ],
} as QuizData;
