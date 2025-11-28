// constants.js

const MAP_WIDTH = 300;
const MAP_HEIGHT = 900;
const MAP_CENTER_Y = 450;
const MAX_ADVANCEMENT_DISTANCE = 450; // 맵 중앙까지의 거리 (900/2)
const MAX_MONSTER_LEVEL = 300;

const OUTPOST_CHANCE = 0.005; // 0.5% 확률로 거점 생성
const MOUNTAIN_CHANCE = 0.20; // 20% 확률로 산 생성

module.exports = {
    MAP_WIDTH,
    MAP_HEIGHT,
    MAP_CENTER_Y,
    MAX_ADVANCEMENT_DISTANCE,
    MAX_MONSTER_LEVEL,
    OUTPOST_CHANCE,
    MOUNTAIN_CHANCE
};