# 🎹 Piano Composer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Flask](https://img.shields.io/badge/Flask-Python%203.8%2B-blue.svg)
![Magenta.js](https://img.shields.io/badge/Magenta.js-v1.3.1-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)


🎥 [Video Demo](https://youtu.be/4_vXxbYrR8s)


Piano Composer is an interactive web application that allows users to compose music using natural language commands. Leveraging the power of Magenta.js and a Flask backend, this application generates, visualizes, and plays music based on user input. Users can also repeat their compositions and download them as MIDI files for further use.

## 🚀 Features

- **Natural Language Composition**: Input commands like "Play a happy melody" to generate corresponding music.
- **Interactive Piano Visualization**: Watch as notes are played on a dynamic piano interface.
- **Repeat Functionality**: Loop your compositions indefinitely with a single click.
- **Downloadable MIDI Files**: Export your creations as MIDI files for use in other music software.
- **Responsive Design**: Enjoy seamless interaction across various devices and screen sizes.
- **Real-Time Feedback**: View and interact with your conversation history alongside the music generation.

## 🎥 Demo

![Piano Composer Demo](https://github.com/Legedith/composer/blob/8d5b6b14134e30ab8c06054211c5979ac8298228/composer.gif)


## 🛠️ Technologies Used


- **LLM**:
  - The AI Agent powering Piano Composer was created on [Lyzr](agent.lyzr.ai)
  - The environment, tools, modules, and configuration can be done with just a few clicks by using Lyzr, greatly simplifying the development process.
- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - [Magenta.js](https://magenta.tensorflow.org/) for music generation and MIDI handling
- **Backend**:
  - [Flask](https://flask.palletsprojects.com/) (Python) for serving API endpoints
- **Others**:
  - SVG for piano visualization
  - Canvas API for visual effects

## 📥 Installation

Follow these steps to set up the Piano Composer application locally on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/piano-composer.git
cd piano-composer
```

### 2. Set Up a Virtual Environment

It's recommended to use a virtual environment to manage dependencies.

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

*If `requirements.txt` is not present, create one with the necessary packages:*

```bash
Flask
flask-cors
```

You can install them directly:

```bash
pip install Flask flask-cors
```

### 4. Run the Application

```bash
python server.py
```

*By default, the Flask server runs on `http://localhost:5000`.*

### 5. Access the Application

Open your web browser and navigate to `http://localhost:5000` to start using Piano Composer.

## 📝 Usage

1. **Start the Application**: Launch the Flask server and open the application in your browser.

2. **Compose Music**:
   - Enter a natural language command in the input box, such as "Play a joyful tune".
   - Click the **Send** button to generate music based on your command.
   - The generated music will play automatically, and you'll see the notes visualized on the piano.

3. **Repeat Composition**:
   - After generating music, the **Repeat** button becomes active.
   - Click **Repeat** to loop the current composition indefinitely.
   - Click **Stop Repeat** to end the looping.

4. **Download Composition**:
   - Click the **Download** button to export your composition as a MIDI file.
   - The MIDI file can be used in other music software for further editing or playback.

## 📂 Project Structure

```
piano-composer/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.py
├── requirements.txt
└── README.md
```

- **public/**: Contains all frontend assets.
  - **index.html**: Main HTML file.
  - **style.css**: Stylesheet for the application.
  - **script.js**: JavaScript logic for interactivity and functionality.
- **server.py**: Flask backend serving API endpoints.
- **requirements.txt**: Python dependencies.
- **README.md**: Project documentation.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Piano Composer, please follow these steps:

1. **Fork the Repository**: Click the **Fork** button at the top right of this page.

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/yourusername/piano-composer.git
   cd piano-composer
   ```

3. **Create a New Branch**:

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Changes**: Implement your feature or fix.

5. **Commit Your Changes**:

   ```bash
   git commit -m "Add feature: YourFeatureName"
   ```

6. **Push to Your Fork**:

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request**: Navigate to the original repository and create a pull request from your branch.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any inquiries or feedback, please reach out to [your.email@example.com](mailto:your.email@example.com).

---

*Happy Composing! 🎶*
