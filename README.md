# OnTime - Smart Study Planner

OnTime is a comprehensive, web-based study planner designed to help students organize their subjects, manage daily schedules, track assignments, and visualize their progress. Built with vanilla HTML, CSS, and JavaScript, it runs entirely in the browser using LocalStorage for data persistence.

## 🚀 Features

- **Dashboard Overview**: Get a quick snapshot of your academic status, including pending tasks, upcoming deadlines, and today's schedule.
- **Subject Management**: Organize your courses with color-coded subjects, priorities, and notes.
- **Task Manager**: Track assignments, exams, and revision tasks. Filter by completion status and view due dates with visual urgency indicators.
- **Daily Schedule**: Plan your study sessions hour-by-hour with built-in conflict detection.
- **Analytics**: Visualize your productivity with dynamic charts showing task completion rates and subject distribution (built with Canvas API).
- **Customization**: Fully responsive design with a built-in Dark/Light mode toggle.
- **Data Privacy**: All data is stored locally in your browser. You can export your data to JSON for backup or transfer.

## 🛠️ Technologies Used

- **HTML5**: Semantic structure and accessible markup.
- **CSS3**: Custom styling using CSS Variables for theming, Flexbox/Grid for layout, and responsive media queries.
- **JavaScript (ES6+)**: Core application logic, DOM manipulation, and state management without external frameworks.
- **Canvas API**: Custom-drawn charts for the analytics section.
- **LocalStorage**: Client-side data persistence ensuring data remains available after page reloads.

## 📂 Project Structure

```text
smart-study-planner/
├── index.html      # Main application structure and layout
├── styles.css      # Global styles, theming, and responsive design
├── script.js       # Application logic, data handling, and UI interactions
└── README.md       # Project documentation
```

## 💾 Data Management

- **Auto-Save**: Changes are automatically saved to your browser's LocalStorage.
- **Export**: Go to **Settings > Data Management** to download a backup of your data (`.json`).
- **Reset**: You can wipe all data from the Settings menu to start fresh.

