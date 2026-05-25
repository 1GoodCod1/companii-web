import * as THREE from 'three';
import { RoomShapeType } from '../types';

export function getSvgPathForShape(shapeType: RoomShapeType | undefined, w: number, h: number): string {
  if (!shapeType || shapeType === 'rectangle') {
    return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }
  
  if (shapeType === 'l-shape') {
    const tW = w * 0.5; // thickness
    const tH = h * 0.5;
    return `M 0 0 L ${tW} 0 L ${tW} ${h - tH} L ${w} ${h - tH} L ${w} ${h} L 0 ${h} Z`;
  }
  
  if (shapeType === 't-shape') {
    const tW = w * 0.33;
    const tH = h * 0.5;
    return `M ${tW} 0 L ${w - tW} 0 L ${w - tW} ${h - tH} L ${w} ${h - tH} L ${w} ${h} L 0 ${h} L 0 ${h - tH} L ${tW} ${h - tH} Z`;
  }
  
  if (shapeType === 'u-shape') {
    const tW = w * 0.25;
    const tH = h * 0.5;
    return `M 0 0 L ${tW} 0 L ${tW} ${h - tH} L ${w - tW} ${h - tH} L ${w - tW} 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }

  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
}

export function getThreeShapeForShape(shapeType: RoomShapeType | undefined, w: number, h: number): THREE.Shape {
  const shape = new THREE.Shape();
  
  if (!shapeType || shapeType === 'rectangle') {
    shape.moveTo(0, 0);
    shape.lineTo(w, 0);
    shape.lineTo(w, -h);
    shape.lineTo(0, -h);
    shape.lineTo(0, 0);
    return shape;
  }
  
  if (shapeType === 'l-shape') {
    const tW = w * 0.5;
    const tH = h * 0.5;
    shape.moveTo(0, 0);
    shape.lineTo(tW, 0);
    shape.lineTo(tW, -(h - tH));
    shape.lineTo(w, -(h - tH));
    shape.lineTo(w, -h);
    shape.lineTo(0, -h);
    shape.lineTo(0, 0);
    return shape;
  }
  
  if (shapeType === 't-shape') {
    const tW = w * 0.33;
    const tH = h * 0.5;
    shape.moveTo(tW, 0);
    shape.lineTo(w - tW, 0);
    shape.lineTo(w - tW, -(h - tH));
    shape.lineTo(w, -(h - tH));
    shape.lineTo(w, -h);
    shape.lineTo(0, -h);
    shape.lineTo(0, -(h - tH));
    shape.lineTo(tW, -(h - tH));
    shape.lineTo(tW, 0);
    return shape;
  }
  
  if (shapeType === 'u-shape') {
    const tW = w * 0.25;
    const tH = h * 0.5;
    shape.moveTo(0, 0);
    shape.lineTo(tW, 0);
    shape.lineTo(tW, -(h - tH));
    shape.lineTo(w - tW, -(h - tH));
    shape.lineTo(w - tW, 0);
    shape.lineTo(w, 0);
    shape.lineTo(w, -h);
    shape.lineTo(0, -h);
    shape.lineTo(0, 0);
    return shape;
  }

  // fallback
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, -h);
  shape.lineTo(0, -h);
  shape.lineTo(0, 0);
  return shape;
}
