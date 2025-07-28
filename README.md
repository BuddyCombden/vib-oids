# 🐦 Boids Simulation

**This was created, tweaked, and polished in 45 minutes with 6 prompts and some minor manual CSS tweaks.**

A beautiful HTML5/JavaScript implementation of Craig Reynolds' Boids algorithm, featuring flocking behavior with interactive controls.

## Features

- **Real-time flocking simulation** with 50 boids by default
- **Interactive controls:**
  - Speed slider (0.5x to 3x movement speed)
  - Boid count input (10-200 boids)
- **Beautiful visual design** with gradient backgrounds and smooth animations
- **Trail effects** for enhanced visual appeal
- **Responsive controls** with real-time updates

## How to Run

1. Simply open `index.html` in any modern web browser
2. The simulation will start automatically
3. Use the controls to adjust speed and boid count in real-time

## How It Works

The boids follow three simple rules that create emergent flocking behavior:

1. **Separation**: Avoid crowding neighbors (steer away from nearby boids)
2. **Alignment**: Steer toward the average heading of neighbors
3. **Cohesion**: Steer toward the average position of neighbors

## Controls

- **Movement Speed Slider**: Adjust how fast the boids move (0.5x to 3x)
- **Number of Boids**: Change the number of boids in the simulation (10-200)

## Technical Details

- Built with vanilla JavaScript (no dependencies)
- Uses HTML5 Canvas for rendering
- Implements the classic Boids algorithm
- Smooth 60fps animation with `requestAnimationFrame`
- Responsive design with modern CSS

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 Classes
- `requestAnimationFrame`

## Files

- `index.html` - Main HTML page with controls and styling
- `boids.js` - JavaScript implementation of the boids algorithm
- `README.md` - This documentation file

Enjoy watching the boids flock together! 🐦✨ 