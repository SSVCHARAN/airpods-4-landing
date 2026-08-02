<div align="center">

  # 🎧 AirPods 4 — Interactive 3D Web Experience

  <p align="center">
    <strong>An Apple-inspired, cinematic 3D web showcase for AirPods 4 featuring real-time WebGL rendering, scroll-driven camera choreography, and glassmorphism UI.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Three.js-v0.160.0-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/CSS3-Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/WebGL-3D%20Choreography-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="WebGL" />
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-live-demo--preview">Preview</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-architecture--code-highlights">Architecture</a> •
    <a href="#-author">Author</a>
  </p>

</div>

---

## 📖 Overview

The **AirPods 4 Interactive 3D Web Experience** is a modern, high-performance product landing page. Built with **Three.js** and **WebGL**, it presents a 3D model of AirPods that responds dynamically to user scroll, mouse movement, and device theme preferences.

As the user scrolls down the page, the 3D model smoothly navigates through space—rotating, zooming, and tilting—to seamlessly tell the product story of the Apple H2 chip, Active Noise Cancellation, Personalized Spatial Audio, skin-detect sensors, and all-day battery life.

---

## ✨ Key Features

- 🌀 **Scroll-Driven 3D Choreography**: Real-time position, rotation angle, and camera scale transformations synced fluidly with page scroll depth using Three.js.
- 💡 **Studio Lighting & ACES Filmic Tone Mapping**: Multi-source key, fill, ambient, and rim directional lighting calibrated for photo-realistic materials.
- 🌗 **Persistent Theme Engine**: Dark and Light theme toggle with automatic system/localStorage persistence (`airpods-theme`).
- ✨ **Interactive Micro-Interactions**:
  - **Pointer Glow Tracking (`[data-glow]`)**: Cards feature radial lighting halos that track cursor position.
  - **3D Parallax Tilt (`[data-tilt]`)**: Hovering over feature cards triggers dynamic 3D tilting.
  - **Magnetic Spring Buttons**: Interactive CTA buttons feature magnetic hover pull with internal text layer depth separation.
- 📌 **Sticky Scroll Storytelling**: Locked-in narrative presentation for the H2 audio engine performance section.
- 🔋 **Interactive Selection Grid**: Model breakdown comparing AirPods 4 ($129) and AirPods 4 with ANC ($179).
- 📱 **Fully Responsive Layout**: Dynamic WebGL viewport resizing supporting desktop, tablet, and mobile browsers.

---

## 🛠 Tech Stack

| Technology | Usage |
| :--- | :--- |
| **HTML5** | Semantic web layout, accessibility, and import maps |
| **CSS3 (Vanilla)** | Glassmorphism, CSS Custom Properties, CSS Grid/Flexbox, backdrop filters |
| **JavaScript (ES Modules)** | App logic, theme controller, tilt & glow micro-interactions |
| **Three.js (v0.160.0)** | 3D WebGL scene setup, camera projection, and ambient lighting |
| **GLTFLoader** | Asynchronous 3D GLTF asset rendering (`mp71hwp3-air_pods_pro.glb`) |
| **Google Fonts** | Inter typography family |

---

## 📁 Project Structure

```text
airpods4-3d-experience/
├── index.html                  # HTML markup, semantic structure & import maps
├── main.js                     # Three.js 3D scene, lighting, GLTF loader & scroll engine
├── style.css                   # CSS design system, glassmorphism, theme variables & layouts
├── mp71hwp3-air_pods_pro.glb   # High-definition 3D GLTF model of AirPods
├── comparison.png              # Preview graphic asset
└── README.md                   # GitHub project documentation
