// mapGenerator.js

const {
    MAP_HEIGHT, MAP_CENTER_Y, MAX_ADVANCEMENT_DISTANCE,
    MAX_MONSTER_LEVEL, OUTPOST_CHANCE, MOUNTAIN_CHANCE, MAP_WIDTH
} = require('./constants');
const MapStaticData = require('./mapStaticDataModel.js'); // MongoDB 모델 (별도 파일 혹은 server.js에서 정의)


/** 몬스터 레벨을 Y축 대칭 구조로 계산 (중앙 Y=450에서 최고 레벨) */
function determineMonsterLevel(y) {
    let advancementDistance = 0;

    if (y < MAP_CENTER_Y) {
        // 왕국 측 (Y가 높을수록 중앙에 가까움)
        advancementDistance = y;
    } else {
        // 제국 측 (Y가 낮을수록 중앙에 가까움)
        advancementDistance = MAP_HEIGHT - 1 - y;
    }

    const levelIncreaseRatio = advancementDistance / MAX_ADVANCEMENT_DISTANCE;

    // Level = (Max Level - 1) * 비율 + 1
    const level = Math.floor(levelIncreaseRatio * (MAX_MONSTER_LEVEL - 1)) + 1;

    return Math.min(level, MAX_MONSTER_LEVEL);
}

/** 팩션 타입에 따라 타일 타입 지정 */
function determineTileType(factionType) {
    // Warzone의 경우 몬스터 및 거점 밀집도를 높이거나 지형을 다르게 설정 가능
    if (Math.random() < MOUNTAIN_CHANCE) return 'Mountain';
    return 'Plain';
}

/** 몬스터/거점 배치 */
function determineMapObject(level) {
    // 0.5% 확률로 거점 생성
    if (Math.random() < OUTPOST_CHANCE) {
        return {
            type: 'Outpost',
            initialMonsterLevel: level + 5,
            initialMonsterCount: 500
        };
    }
    // 일반 몬스터 스폰 지역
    return {
        type: 'MonsterSpot',
        initialMonsterLevel: level,
        initialMonsterCount: Math.floor(Math.random() * 50) + 10
    };
}


/** 맵 데이터 전체를 생성하고 MongoDB에 저장 */
async function generateAndSaveMapData() {
    console.log("맵 데이터 자동 생성 시작...");
    const mapDataToSave = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {

            // 1. 팩션 타입 결정
            let factionType;
            if (x < 100) factionType = 'Kingdom';
            else if (x < 200) factionType = 'Warzone';
            else factionType = 'Empire';

            // 2. 레벨 및 오브젝트 결정
            const monsterLevel = determineMonsterLevel(y);
            const mapObject = determineMapObject(monsterLevel);

            mapDataToSave.push({
                globalX: x,
                globalY: y,
                factionType,
                tileType: determineTileType(factionType),
                hasObject: mapObject.type !== 'None',
                object: mapObject
            });
        }
    }

    // 이전 데이터 삭제 후, MongoDB에 일괄 저장
    await MapStaticData.deleteMany({});
    await MapStaticData.insertMany(mapDataToSave);
    console.log(`총 ${mapDataToSave.length}개 타일 데이터 MongoDB에 영구 저장 완료.`);
}

module.exports = {
    generateAndSaveMapData,
};