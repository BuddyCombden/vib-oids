class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.maxSpeed = 1.25; // Increased by 25%
        this.maxForce = 0.05;
        this.type = 'boid';
        
        // Random color for each boid
        const colors = [
            { primary: '#4CAF50', secondary: '#81C784', stroke: '#2E7D32' }, // Green
            { primary: '#2196F3', secondary: '#64B5F6', stroke: '#1976D2' }, // Blue
            { primary: '#FF9800', secondary: '#FFB74D', stroke: '#F57C00' }, // Orange
            { primary: '#E91E63', secondary: '#F06292', stroke: '#C2185B' }, // Pink
            { primary: '#9C27B0', secondary: '#BA68C8', stroke: '#7B1FA2' }, // Purple
            { primary: '#00BCD4', secondary: '#4DD0E1', stroke: '#0097A7' }, // Cyan
            { primary: '#FF5722', secondary: '#FF8A65', stroke: '#D84315' }, // Red-Orange
            { primary: '#795548', secondary: '#A1887F', stroke: '#5D4037' }  // Brown
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    // Apply a force to the boid
    applyForce(force) {
        this.vx += force.x;
        this.vy += force.y;
    }

    // Update boid position
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
    }

    // Draw the boid
    draw(ctx) {
        const angle = Math.atan2(this.vy, this.vx);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        // Draw boid as a triangle
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -3);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        
        // Create gradient for boid using random color
        const gradient = ctx.createLinearGradient(-4, -3, 8, 0);
        gradient.addColorStop(0, this.color.primary);
        gradient.addColorStop(1, this.color.secondary);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this.color.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

class Void {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.3; // Much slower than boids
        this.vy = (Math.random() - 0.5) * 0.3;
        this.maxSpeed = 0.3; // Slower max speed
        this.maxForce = 0.02; // Gentler steering
        this.type = 'void';
        this.radius = 6; // Size of the void sphere
    }

    // Apply a force to the void
    applyForce(force) {
        this.vx += force.x;
        this.vy += force.y;
    }

    // Update void position
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
    }

    // Draw the void
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw void as a dark purple sphere
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        
        // Create radial gradient for void
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#6A1B9A'); // Dark purple center
        gradient.addColorStop(0.7, '#8E24AA'); // Medium purple
        gradient.addColorStop(1, '#4A148C'); // Darker purple edge
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.shadowColor = '#6A1B9A';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#4A148C';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

class BoidsSimulation {
    constructor() {
        this.canvas = document.getElementById('boidsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boids = [];
        this.voids = [];
        this.speedMultiplier = 3.0;
        this.boidCount = 300;
        this.voidCount = 8;
        this.neighborRadius = 50;
        this.separationWeight = 1.5;
        this.alignmentWeight = 1.0;
        this.cohesionWeight = 1.0;
        
        this.resizeCanvas();
        this.initializeEntities();
        this.setupControls();
        this.setupResizeHandler();
        this.animate();
    }

    initializeEntities() {
        this.boids = [];
        this.voids = [];
        
        // Initialize boids
        for (let i = 0; i < this.boidCount; i++) {
            this.boids.push(new Boid(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
        
        // Initialize voids
        for (let i = 0; i < this.voidCount; i++) {
            this.voids.push(new Void(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initializeEntities();
        });
    }

    setupControls() {
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const boidCountInput = document.getElementById('boidCount');

        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            speedValue.textContent = e.target.value;
        });

        boidCountInput.addEventListener('change', (e) => {
            const newCount = parseInt(e.target.value);
            if (newCount >= 10 && newCount <= 500) {
                this.boidCount = newCount;
                this.initializeEntities();
            }
        });
    }

    // Calculate separation force (avoid crowding)
    separation(entity) {
        let steerX = 0;
        let steerY = 0;
        let count = 0;

        // For boids: separate from other boids and voids
        if (entity.type === 'boid') {
            // Separate from other boids
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius) {
                    const force = 1 / distance;
                    steerX += dx * force;
                    steerY += dy * force;
                    count++;
                }
            }
            
            // Separate from voids (high separation weight)
            for (let void_ of this.voids) {
                const dx = entity.x - void_.x;
                const dy = entity.y - void_.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * 1.2) { // Slightly larger radius for void detection
                    const force = 1 / distance;
                    steerX += dx * force;
                    steerY += dy * force;
                    count++;
                }
            }
        }
        
        // For voids: separate from other voids (high separation weight)
        if (entity.type === 'void') {
            for (let other of this.voids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius) {
                    const force = 1 / distance;
                    steerX += dx * force;
                    steerY += dy * force;
                    count++;
                }
            }
        }

        if (count > 0) {
            steerX /= count;
            steerY /= count;
            
            // Normalize and apply weight (higher separation for voids and boids avoiding voids)
            const magnitude = Math.sqrt(steerX * steerX + steerY * steerY);
            if (magnitude > 0) {
                let separationWeight;
                if (entity.type === 'void') {
                    separationWeight = 3.0; // Voids avoid other voids
                } else if (entity.type === 'boid' && count > 0) {
                    // Check if any of the separation forces are from voids
                    let hasVoidSeparation = false;
                    for (let void_ of this.voids) {
                        const dx = entity.x - void_.x;
                        const dy = entity.y - void_.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 0 && distance < this.neighborRadius * 1.2) {
                            hasVoidSeparation = true;
                            break;
                        }
                    }
                    separationWeight = hasVoidSeparation ? 2.5 : this.separationWeight; // Higher separation from voids
                } else {
                    separationWeight = this.separationWeight;
                }
                steerX = (steerX / magnitude) * entity.maxForce * separationWeight;
                steerY = (steerY / magnitude) * entity.maxForce * separationWeight;
            }
        }

        return { x: steerX, y: steerY };
    }

    // Calculate alignment force (steer toward average heading)
    alignment(entity) {
        let avgVx = 0;
        let avgVy = 0;
        let count = 0;

        if (entity.type === 'boid') {
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius) {
                    avgVx += other.vx;
                    avgVy += other.vy;
                    count++;
                }
            }
        } else if (entity.type === 'void') {
            for (let other of this.voids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius) {
                    avgVx += other.vx;
                    avgVy += other.vy;
                    count++;
                }
            }
        }

        if (count > 0) {
            avgVx /= count;
            avgVy /= count;
            
            // Normalize and apply weight
            const magnitude = Math.sqrt(avgVx * avgVx + avgVy * avgVy);
            if (magnitude > 0) {
                avgVx = (avgVx / magnitude) * entity.maxForce * this.alignmentWeight;
                avgVy = (avgVy / magnitude) * entity.maxForce * this.alignmentWeight;
            }
        }

        return { x: avgVx, y: avgVy };
    }

    // Calculate cohesion force (steer toward average position)
    cohesion(entity) {
        let centerX = 0;
        let centerY = 0;
        let count = 0;

        if (entity.type === 'boid') {
            for (let other of this.boids) {
                if (other === entity) continue;
                
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius) {
                    centerX += other.x;
                    centerY += other.y;
                    count++;
                }
            }
        } else if (entity.type === 'void') {
            // Voids have high cohesion with boids
            for (let other of this.boids) {
                const dx = entity.x - other.x;
                const dy = entity.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && distance < this.neighborRadius * 1.5) { // Larger radius for void-boid cohesion
                    centerX += other.x;
                    centerY += other.y;
                    count++;
                }
            }
        }

        if (count > 0) {
            centerX /= count;
            centerY /= count;
            
            const steerX = centerX - entity.x;
            const steerY = centerY - entity.y;
            
            // Normalize and apply weight (higher cohesion for voids with boids)
            const magnitude = Math.sqrt(steerX * steerX + steerY * steerY);
            if (magnitude > 0) {
                const cohesionWeight = entity.type === 'void' ? 2.5 : this.cohesionWeight;
                return {
                    x: (steerX / magnitude) * entity.maxForce * cohesionWeight,
                    y: (steerY / magnitude) * entity.maxForce * cohesionWeight
                };
            }
        }

        return { x: 0, y: 0 };
    }

    update() {
        // Update boids
        for (let boid of this.boids) {
            // Apply flocking forces
            const separation = this.separation(boid);
            const alignment = this.alignment(boid);
            const cohesion = this.cohesion(boid);

            boid.applyForce(separation);
            boid.applyForce(alignment);
            boid.applyForce(cohesion);

            // Limit speed before applying multiplier
            const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
            if (speed > boid.maxSpeed) {
                boid.vx = (boid.vx / speed) * boid.maxSpeed;
                boid.vy = (boid.vy / speed) * boid.maxSpeed;
            }

            // Update position with speed multiplier
            boid.x += boid.vx * this.speedMultiplier;
            boid.y += boid.vy * this.speedMultiplier;
            
            // Wrap around edges
            if (boid.x < 0) boid.x = this.canvas.width;
            if (boid.x > this.canvas.width) boid.x = 0;
            if (boid.y < 0) boid.y = this.canvas.height;
            if (boid.y > this.canvas.height) boid.y = 0;
        }

        // Update voids
        for (let void_ of this.voids) {
            // Apply flocking forces
            const separation = this.separation(void_);
            const alignment = this.alignment(void_);
            const cohesion = this.cohesion(void_);

            void_.applyForce(separation);
            void_.applyForce(alignment);
            void_.applyForce(cohesion);

            // Limit speed before applying multiplier
            const speed = Math.sqrt(void_.vx * void_.vx + void_.vy * void_.vy);
            if (speed > void_.maxSpeed) {
                void_.vx = (void_.vx / speed) * void_.maxSpeed;
                void_.vy = (void_.vy / speed) * void_.maxSpeed;
            }

            // Update position with speed multiplier
            void_.x += void_.vx * this.speedMultiplier;
            void_.y += void_.vy * this.speedMultiplier;
            
            // Wrap around edges
            if (void_.x < 0) void_.x = this.canvas.width;
            if (void_.x > this.canvas.width) void_.x = 0;
            if (void_.y < 0) void_.y = this.canvas.height;
            if (void_.y > this.canvas.height) void_.y = 0;
        }
    }

    draw() {
        // Clear canvas with semi-transparent background for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all boids
        for (let boid of this.boids) {
            boid.draw(this.ctx);
        }

        // Draw all voids
        for (let void_ of this.voids) {
            void_.draw(this.ctx);
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Start the simulation when the page loads
window.addEventListener('load', () => {
    new BoidsSimulation();
}); 