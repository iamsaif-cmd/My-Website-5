// =========================================
// AURA ENGINE - JS SETUP
// =========================================

// 1. Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // var(--ease-out-expo) equivalent
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Lenis requestAnimationFrame loop
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 3. Initial Hero Animations
document.addEventListener("DOMContentLoaded", () => {
    
    // Animate Navbar
    gsap.from(".glass-nav", {
        y: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.2
    });

    // Animate Hero Content
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.to(".hero-title", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: 0.5
    })
    .to(".hero-subtitle", {
        y: 0,
        opacity: 1,
        duration: 1,
    }, "-=0.8")
    .to(".hero-actions", {
        y: 0,
        opacity: 1,
        duration: 1,
    }, "-=0.8");

    // Smile Matrix - 3D WebGL Teeth
    const container = document.getElementById('threejs-teeth-container');
    if (container && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a192f); // Deep Luxury Midnight Blue background
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 15);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setClearColor(0x000000, 0); 
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true; // Enable Shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;

        // Realistic Medical Studio Lighting with Shadows
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
        mainLight.position.set(5, 5, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        scene.add(mainLight);
        
        const rimLight = new THREE.PointLight(0x00ffff, 0.2); // Subtle cyan rim for tech feel
        rimLight.position.set(-10, 0, -5);
        scene.add(rimLight);

        const teethGroup = new THREE.Group();
        const archRadius = 4;
        const teethData = []; 

        // Infection color palettes
        const infectionTypes = [
            { name:'plaque',    colors:[0xd4c87a, 0xc9b95c, 0xbfad44], rough:0.7, metal:0.05 },
            { name:'tartar',    colors:[0x8b6914, 0x7a5c10, 0x6b4e0a], rough:0.9, metal:0.0 },
            { name:'cavity',    colors:[0x2a1f0a, 0x1a1208, 0x0f0a04], rough:0.95, metal:0.0 },
            { name:'necrotic',  colors:[0x4a4a50, 0x3a3a40, 0x2d2d32], rough:0.85, metal:0.05 },
            { name:'fluorosis', colors:[0xe8e0c0, 0xddd5b0, 0xf0e8d0], rough:0.5, metal:0.1 },
            { name:'erosion',   colors:[0xc8a848, 0xb89838, 0xa88828], rough:0.75, metal:0.02 },
            { name:'stain',     colors:[0x8b5e3c, 0x7b4e2c, 0x6b3e1c], rough:0.8, metal:0.0 },
        ];

        function pickRandomInfection() {
            const rand = Math.random();
            if (rand < 0.10) return infectionTypes[3]; // necrotic
            if (rand < 0.25) return infectionTypes[2]; // cavity
            if (rand < 0.45) return infectionTypes[1]; // tartar
            if (rand < 0.55) return infectionTypes[6]; // stain
            if (rand < 0.65) return infectionTypes[5]; // erosion
            if (rand < 0.75) return infectionTypes[4]; // fluorosis
            return infectionTypes[0]; // plaque
        }

        function applyDamage(td) {
            const inf = pickRandomInfection();
            const c = inf.colors[Math.floor(Math.random()*inf.colors.length)];
            td.badColor = new THREE.Color(c);
            td.badRough = inf.rough;
            td.badMetal = inf.metal;
            td.badRotZ = (inf.name==='necrotic'||inf.name==='cavity') ? (Math.random()-0.5)*0.5 : (Math.random()-0.5)*0.15;
            td.badPosY = td.goodPosY + (Math.random()-0.5)*0.3;
            // Apply immediately
            td.material.color.copy(td.badColor);
            td.material.roughness = td.badRough;
            td.material.metalness = td.badMetal;
            td.material.clearcoat = (inf.name === 'stain' || inf.name === 'plaque') ? 0.2 : 0.0; // Damaged teeth lose shine
            td.material.transmission = 0.02; // Lose translucency
            td.material.emissiveIntensity = 0;
            td.mesh.rotation.z = td.badRotZ;
            td.mesh.position.y = td.badPosY;
        }

        // Build 32 teeth with realistic anatomical scaling and depth
        for (let j = 0; j < 2; j++) {
            const isUpper = j === 0;
            const yOffset = isUpper ? 0.7 : -0.7;
            for (let i = 0; i < 16; i++) {
                let sX=0.45, sY=0.75, sZ=0.35;
                // Incisors (Flat and wide)
                if (i===7||i===8) { sX=0.6; sY=0.85; sZ=0.25; }
                // Lateral Incisors
                if (i===6||i===9) { sX=0.5; sY=0.75; sZ=0.25; }
                // Canines (Pointy and deep)
                if (i===5||i===10) { sX=0.48; sY=0.95; sZ=0.45; }
                // Molars (Bulky and wide)
                if (i<4||i>11) { sX=0.65; sY=0.6; sZ=0.6; }

                const geo = new THREE.SphereGeometry(1, 40, 40); 
                const mat = new THREE.MeshPhysicalMaterial({
                    color: 0xe8e4d8, // Creamy Ivory (Natural, not bleached)
                    roughness: 0.2,
                    metalness: 0.0,
                    clearcoat: 0.5,
                    clearcoatRoughness: 0.2,
                    transmission: 0.05,
                    thickness: 0.5,
                    ior: 1.45,
                    emissive: new THREE.Color(0x000000), // Disable glow
                    emissiveIntensity: 0
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.scale.set(sX, sY, sZ);
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                const angle = (i/15)*Math.PI - Math.PI/2;
                mesh.position.x = Math.sin(angle)*archRadius;
                mesh.position.z = Math.cos(angle)*archRadius - archRadius;
                mesh.rotation.y = angle;

                const td = { mesh, material:mat, goodPosY:yOffset, badColor:null, badRough:0, badMetal:0, badRotZ:0, badPosY:yOffset };
                applyDamage(td);
                teethData.push(td);
                teethGroup.add(mesh);
            }
        }

        scene.add(teethGroup);
        teethGroup.rotation.x = 0.2;

        // Perfect Overview Camera
        camera.position.set(0, 0, 15); 

        function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
        animate();

        let isRepaired = false;
        const btnRepair = document.getElementById('btn-repair');
        const statusText = document.querySelector('.status-text');

        if (btnRepair) {
            btnRepair.addEventListener('click', () => {
                btnRepair.disabled = true;
                if (isRepaired) {
                    btnRepair.textContent = "Processing...";
                    statusText.textContent = "Resetting...";
                    gsap.to(".scanner-line", { opacity: 0, duration: 0.2 });
                    gsap.set(".scanner-line", { x: -20 });

                    teethData.forEach((td, i) => {
                        td.isFixed = false; // Reset fixed state for next scan
                        applyDamage(td); // fresh random infections
                        gsap.to(td.mesh.rotation, { z: td.badRotZ, duration: 0.8, ease:"power2.inOut", delay: i*0.03 });
                        gsap.to(td.mesh.position, { y: td.badPosY, duration: 0.8, ease:"power2.inOut", delay: i*0.03 });
                        gsap.to(td.material.color, { r:td.badColor.r, g:td.badColor.g, b:td.badColor.b, duration:0.8, delay:i*0.03 });
                        gsap.to(td.material, { roughness:td.badRough, metalness:td.badMetal, emissiveIntensity:0, duration:0.8, delay:i*0.03 });
                    });

                    setTimeout(() => {
                        isRepaired = false;
                        btnRepair.textContent = "Start Repair";
                        statusText.textContent = "Awaiting Scan...";
                        btnRepair.disabled = false;
                    }, 1500);
                } else {
                    btnRepair.textContent = "Scanning...";
                    statusText.textContent = "Scanning...";
                    gsap.set(".scanner-line", { opacity: 1, x: -20 });

                    gsap.to(".scanner-line", {
                        x: 300, duration: 2.5, ease: "power1.inOut",
                        onUpdate: function() {
                            const progress = this.progress();
                            const half = 16;
                            const count = Math.floor(progress * half);
                            for (let i = 0; i < count; i++) {
                                // Repair both upper (i) and lower (i + 16) together
                                const indices = [i, i + half];
                                indices.forEach(idx => {
                                    const td = teethData[idx];
                                    if (!td.isFixed) {
                                        td.isFixed = true; // Prevents re-animating already fixed teeth
                                        gsap.to(td.mesh.rotation, { z:0, duration:0.5, ease: "back.out(1.7)" });
                                        gsap.to(td.mesh.position, { y:td.goodPosY, duration:0.5 });
                                        gsap.to(td.material.color, { r:0.91, g:0.89, b:0.85, duration:0.4, overwrite:"auto" }); // Creamy Ivory
                                        gsap.to(td.material, { 
                                            roughness: 0.2, 
                                            metalness: 0, 
                                            clearcoat: 0.5, 
                                            transmission: 0.05,
                                            emissiveIntensity: 0, 
                                            duration: 0.4, 
                                            overwrite: "auto" 
                                        });
                                    }
                                });
                            }
                        },
                        onComplete: function() {
                            gsap.to(".scanner-line", { opacity: 0, duration: 0.3 });
                            statusText.textContent = "Perfected ✨";
                            isRepaired = true;
                            btnRepair.textContent = "Reset Demo";
                            btnRepair.disabled = false;
                        }
                    });
                }
            });
        }
        
        // Handle window resize for the canvas
        window.addEventListener('resize', () => {
            if(container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }

    // Float animation for Aura Orbs
    gsap.to(".orb-1", {
        y: 50,
        x: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".orb-2", {
        y: -40,
        x: 40,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // 4. Parallax Animations (Aura Engine Scroll Effects)
    
    // Philosophy Image Parallax
    gsap.to(".philosophy-image", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
            trigger: ".philosophy-image-wrapper",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Technology Background Parallax
    gsap.to(".tech-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".technology",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // 5. Magnetic Buttons Logic
    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (!isTouchDevice) {
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Move button slightly towards mouse
                gsap.to(btn, {
                    x: x * 0.4,
                    y: y * 0.4,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                // Return to original position
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

});
