import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class AirPodsExperience {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.clock = new THREE.Clock();
        
        // State
        this.model = null;
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();
        this.scrollProgress = 0;
        this.lerpedScroll = 0;
        
        // Animation Constraints
        this.baseScale = 1;
        this.sections = [
            'hero',
            'iconic-hook',
            'chip-story',
            'anc',
            'spatial-audio',
            'sensors',
            'battery',
            'specs'
        ];

        this.init();
    }

    async init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Calibrated Lighting: Lowering exposure to avoid "blown out" look
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0; /* Slightly lower for more contrast */
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 6;

        this.setupLights();
        await this.loadModel();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.onResize();
        this.animate();
        this.setupIntersectionObserver();
        this.setupMagneticButtons();
        this.setupTiltEffect();
        
        // Hide loader after a short delay or when everything is ready
        setTimeout(() => {
            const loader = document.getElementById('global-loader');
            if (loader) loader.classList.add('fade-out');
        }, 1000);
    }

    setupTiltEffect() {
        const cards = document.querySelectorAll('[data-tilt]');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (centerY - y) / 20;
                const rotateY = (x - centerX) / 20;
                
                card.style.setProperty('--rx', rotateX.toFixed(2));
                card.style.setProperty('--ry', rotateY.toFixed(2));
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rx', '0');
                card.style.setProperty('--ry', '0');
            });
        });
    }

    setupLights() {
        // High contrast studio lighting for light theme
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Strong key light to create shadows and form
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.8); /* Lowered for realism */
        keyLight.position.set(5, 5, 5);
        this.scene.add(keyLight);
        
        // Fill light to soften dark areas
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
        fillLight.position.set(-5, 0, 2);
        this.scene.add(fillLight);
        
        // Rim light to separate from the background
        const rimLight = new THREE.SpotLight(0xffffff, 4);
        rimLight.position.set(0, 5, -5);
        rimLight.angle = Math.PI / 4;
        rimLight.penumbra = 0.5;
        this.scene.add(rimLight);
    }

    async loadModel() {
        const loader = new GLTFLoader();
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load('./mp71hwp3-air_pods_pro.glb', resolve, undefined, reject);
            });

            this.model = gltf.scene;
            
            // Center model
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            this.model.position.sub(center);
            
            // Stabilized Base Scale
            const maxDim = Math.max(size.x, size.y, size.z);
            this.baseScale = 3.5 / maxDim;
            this.model.scale.setScalar(this.baseScale);

            this.model.traverse((child) => {
                if (child.isMesh) {
                    // Refined Material Settings
                    child.material.envMapIntensity = 1.0; 
                    child.material.roughness = 0.1;
                    child.material.metalness = 0.2;
                }
            });

            this.scene.add(this.model);
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        const scrolled = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollProgress = scrolled / totalHeight;
        
        this.updateStickyStory(scrolled);
    }

    updateStickyStory(scrolled) {
        const storySection = document.getElementById('chip-story');
        if (!storySection) return;

        const contents = document.querySelectorAll('.story-content');
        const rect = storySection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const progress = Math.max(0, Math.min(1, Math.abs(rect.top) / (rect.height - window.innerHeight)));
            const index = Math.min(Math.floor(progress * contents.length), contents.length - 1);
            contents.forEach((c, i) => c.classList.toggle('active', i === index));
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    setupMagneticButtons() {
        const buttons = document.querySelectorAll('.cta, .cta-large');
        buttons.forEach(btn => {
            // Wrap text in a span if not already done to apply parallax depth effect
            if (!btn.querySelector('.btn-text')) {
                const text = btn.textContent;
                btn.textContent = '';
                const span = document.createElement('span');
                span.className = 'btn-text';
                span.textContent = text;
                btn.appendChild(span);
            }

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Spring magnetic translation logic mapped to CSS variables
                btn.style.setProperty('--tx', `${x * 0.3}px`);
                btn.style.setProperty('--ty', `${y * 0.3}px`);
                
                // Additional depth parallax for the text inside
                const span = btn.querySelector('.btn-text');
                if (span) {
                    span.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                // Spring back to center
                btn.style.setProperty('--tx', `0px`);
                btn.style.setProperty('--ty', `0px`);
                
                const span = btn.querySelector('.btn-text');
                if (span) {
                    span.style.transform = `translate(0px, 0px)`;
                }
            });
        });
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Framerate independence
        const dt = Math.min(this.clock.getDelta(), 0.1); 
        const elapsed = this.clock.elapsedTime;
        
        // Damping factor: approx 0.08 at 60fps (fluid, heavy inertia)
        const dampFactor = 1 - Math.exp(-5 * dt);

        this.mouse.x += (this.targetMouse.x - this.mouse.x) * dampFactor;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * dampFactor;

        if (this.model) {
            // Mouse Parallax
            const mouseX = this.mouse.x * 0.25;
            const mouseY = this.mouse.y * 0.15;

            // Idle breathing
            const breathingY = Math.sin(elapsed * 0.5) * 0.08;

            // --- CINEMATIC CHOREOGRAPHY SYSTEM ---
            const s = this.scrollProgress; // Use RAW scroll
            let targetPos = new THREE.Vector3(0, 0, 0);
            let targetRot = new THREE.Euler(0, elapsed * 0.05, 0); // Reduced idle rotation
            let targetScale = this.baseScale;

            if (s < 0.10) {
                // HERO -> ICONIC HOOK
                const p = s / 0.10;
                targetPos.set(0, this.lerp(1.3, 0.5, p), this.lerp(-1, 0, p));
                targetRot.set(0.15, this.lerp(elapsed * 0.08, Math.PI * 0.1, p), 0);
                targetScale = this.baseScale;
            }
            else if (s < 0.25) {
                // ICONIC HOOK -> CHIP STORY
                const p = (s - 0.10) / 0.15;
                targetPos.set(0, this.lerp(0.5, -1.2, p), this.lerp(0, 0.5, p));
                targetRot.set(this.lerp(0.15, -0.2, p), this.lerp(Math.PI * 0.1, Math.PI * 0.25, p), 0);
                targetScale = this.baseScale * (1 + p * 0.1);
            }
            else if (s < 0.40) {
                // CHIP STORY
                const p = (s - 0.25) / 0.15;
                targetPos.set(0, -1.2, 0.5);
                targetRot.set(-0.2, Math.PI * 0.25 + p * Math.PI * 0.5, 0);
                targetScale = this.baseScale * 1.1;
            }
            else if (s < 0.55) {
                // CHIP -> ANC
                const p = (s - 0.40) / 0.15;
                targetPos.set(this.lerp(0, 2.0, p), this.lerp(-1.2, 0, p), this.lerp(0.5, 1.0, p));
                targetRot.set(0, Math.PI * 0.75 + p * 0.25, p * 0.2);
                targetScale = this.baseScale * (1.1 + p * 0.1);
            }
            else if (s < 0.70) {
                // ANC -> SPATIAL AUDIO
                const p = (s - 0.55) / 0.15;
                targetPos.set(this.lerp(2.0, -2.0, p), 0, 1.0);
                targetRot.set(p * 0.1, Math.PI * 1.0 + p * Math.PI * 0.5, 0); 
                targetScale = this.baseScale * 1.2;
            }
            else if (s < 0.85) {
                // SPATIAL -> SENSORS
                const p = (s - 0.70) / 0.15;
                targetPos.set(this.lerp(-2.0, 2.0, p), this.lerp(0, -0.5, p), 1.0);
                targetRot.set(0.5, Math.PI * 1.5 + p * 0.5, -0.2);
                targetScale = this.baseScale * 1.2;
            }
            else {
                // SENSORS -> FINAL CTA
                const p = Math.max(0, Math.min(1, (s - 0.85) / 0.15));
                
                const isMobile = window.innerWidth < 768;
                // Position them slightly higher and larger for the grand finale
                const finalScale = isMobile ? 0.5 : 0.6; 
                
                targetPos.set(
                    this.lerp(2.0, 0, p), 
                    this.lerp(-0.5, 2.5, p), // Move higher to avoid overlapping the CTA card
                    this.lerp(1.0, -1.0, p)   // Bring closer to the camera
                );
                // Face the user with a slight tilt
                targetRot.set(this.lerp(0.5, 0.2, p), Math.PI * 2.0, 0);
                targetScale = this.baseScale * this.lerp(1.2, finalScale, p); 
            }

            // Combine target with mouse/breathing logic BEFORE lerping
            const isDark = document.documentElement.classList.contains('dark-theme');
            
            // Adjust Exposure dynamically for dark mode
            const targetExposure = isDark ? 0.6 : 0.85;
            this.renderer.toneMappingExposure = this.lerp(this.renderer.toneMappingExposure, targetExposure, 0.05);

            // In dark mode, restrict wandering/movement
            const motionMultiplier = isDark ? 0.3 : 1.0;

            targetPos.x += mouseX * motionMultiplier;
            targetPos.y += breathingY + (mouseY * 0.5 * motionMultiplier);
            targetRot.x += mouseY * motionMultiplier;
            targetRot.y += mouseX * motionMultiplier;

            // ACTUAL LERPING / DAMPING (The cinematic inertia)
            this.model.position.lerp(targetPos, dampFactor);
            
            // Interpolate rotation safely
            this.model.rotation.x += (targetRot.x - this.model.rotation.x) * dampFactor;
            this.model.rotation.y += (targetRot.y - this.model.rotation.y) * dampFactor;
            this.model.rotation.z += (targetRot.z - this.model.rotation.z) * dampFactor;
            
            // Interpolate scale
            const currentScale = this.model.scale.x;
            const newScale = currentScale + (targetScale - currentScale) * dampFactor;
            this.model.scale.setScalar(newScale);
        }

        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);
    }
}

// --- MAGIC UI: SPARKLES EFFECT ---
function initSparkles() {
    const container = document.getElementById('hero-sparkle-container');
    if (!container) return;

    const colors = ['#A97CF8', '#F38CB8', '#FDCC92', '#ffffff'];
    
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random position within container
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        sparkle.style.left = `${x}%`;
        sparkle.style.top = `${y}%`;
        
        // Random scale (0.3 to 1.3)
        const scale = Math.random() * 1 + 0.3;
        sparkle.style.transform = `scale(${scale})`;
        
        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Official Magic UI Sparkle SVG Path
        sparkle.innerHTML = `
            <svg viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="${color}"/>
            </svg>
        `;
        
        container.appendChild(sparkle);
        
        // Remove after animation finishes (0.8s)
        setTimeout(() => {
            sparkle.remove();
        }, 800);
    }

    // Periodically create sparkles - Slowed down for performance
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            createSparkle();
        }
    }, 600);

    // Initial burst
    for(let i=0; i<5; i++) setTimeout(createSparkle, i * 100);
}

// Start everything
document.addEventListener('DOMContentLoaded', () => {
    new AirPodsExperience();
    initSparkles();
});

// Final CTA Selection Logic
document.addEventListener('DOMContentLoaded', () => {
    const selectionCards = document.querySelectorAll('.selection-card');
    const orderBtn = document.getElementById('order-now-hover-btn');

    if (selectionCards && orderBtn) {
        selectionCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                selectionCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                card.classList.add('active');
                
                // Update button text based on model
                const model = card.getAttribute('data-model');
                if (model === 'standard') {
                    orderBtn.textContent = 'Order AirPods 4';
                } else {
                    orderBtn.textContent = 'Order AirPods 4 with ANC';
                }
                
                // Add a small scale animation to button to signal change
                orderBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    orderBtn.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }
});

// --- ANIMATED THEME TOGGLER (View Transitions API) ---
// Inspired by Magic UI AnimatedThemeToggler — circle-reveal clip-path
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Check saved preference
    const savedTheme = localStorage.getItem('airpods-theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark-theme');

        const applyTheme = () => {
            document.documentElement.classList.toggle('dark-theme');
            document.body.classList.toggle('dark-theme');
            const newIsDark = document.documentElement.classList.contains('dark-theme');
            localStorage.setItem('airpods-theme', newIsDark ? 'dark' : 'light');
        };

        // Fallback for browsers without View Transitions API
        if (typeof document.startViewTransition !== 'function') {
            applyTheme();
            return;
        }

        // Calculate circle origin from the toggle button center
        const rect = toggleBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Max radius = distance from button to farthest viewport corner
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            applyTheme();
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${maxRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 500,
                    easing: 'ease-in-out',
                    fill: 'forwards',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        });
    });
});
