// server.js

const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const { generateAndSaveMapData } = require('./mapGenerator');
// 환경 변수 설정 (DB URL 등)
require('dotenv').config();

const app = express();
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

// MongoDB 스키마 정의 및 모델 생성
const mapStaticSchema = new mongoose.Schema({ /* ... (Schema 정의) ... */ });
const MapStaticData = mongoose.model('MapStaticData', mapStaticSchema);


/** MongoDB 데이터를 Redis에 캐싱하는 함수 */
async function cacheMapDataFromDB() {
    try {
        await redisClient.connect();
        console.log("Redis 연결 성공");

        // 1. MongoDB에서 전체 맵 데이터 조회
        // MapStaticData는 MapStaticSchema를 통해 생성된 Mongoose 모델
        const allMapData = await MapStaticData.find({}).lean();

        // 2. Redis 명령어를 위한 키-값 쌍 배열 생성
        const redisCommands = [];
        for (const data of allMapData) {
            const key = `map:tile:${data.globalX}:${data.globalY}`;
            // MongoDB ID 등 불필요한 필드는 제외하고 JSON.stringify로 문자열화
            const value = JSON.stringify({
                x: data.globalX,
                y: data.globalY,
                faction: data.factionType,
                tile: data.tileType,
                objType: data.object.type,
                // ... 동적 데이터는 제외, 고정 데이터만 캐싱
            });
            redisCommands.push('SET', key, value);
        }

        // 3. Redis에 Bulk Operation으로 저장 (MSET 사용 또는 파이프라인)
        await redisClient.executeBulk(redisCommands);
        console.log(`Redis에 총 ${allMapData.length}개 타일 데이터 캐싱 완료.`);

    } catch (error) {
        console.error("데이터 캐싱 중 오류 발생:", error);
    }
}

/** 서버 초기화 및 시작 */
async function initializeServer() {
    // 1. MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI);

    // 2. 맵 데이터 확인 및 생성
    const count = await MapStaticData.countDocuments();
    if (count === 0) {
        await generateAndSaveMapData(); // mapGenerator 호출
    }

    // 3. Redis 캐싱 실행
    await cacheMapDataFromDB();

    // 4. Express 서버 시작
    app.listen(3000, () => {
        console.log('서버가 포트 3000에서 실행 중...');
    });
}

initializeServer();