import { drawPentagram } from './pentagram';
import { drawCube } from './color_cube';
import { drawSphere } from './sphere';
import { drawThreeObjects } from './three_objects';


function main() {
    drawPentagram('gl-pentagram');
    drawCube('gl-cube');
    drawSphere('gl-sphere');
    drawThreeObjects('gl-three');
}


window.onload = main;