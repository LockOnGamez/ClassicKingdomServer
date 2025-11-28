const mongoose = require('mongoose');

const mapStaticSchema = new mongoose.Schema({
    //맵 좌표 (필수 인덱스)
    globalX: {type: Number, required: true},
    globalY: {type: Number, required: true},

    //맵 타입 정보
    factionType: {type: String, enum: ['Kingdom', 'Warzone', 'Empire'], required: true},
    tileType: {type: String, enum: ['Plain', 'Mountain', 'Road', 'Forest'], required: true},

    //오브젝트 정보 (타일에 거점/몬스터가 있는 경우)
    hasObject: {type: Boolean, default: false},
    object: {
        type: {type: String, enum: ['Outpost', 'MonsterSpot', 'None']},
        initialMonsterLevel: {type: Number, default: 0},
        initialMonsterCount: {type: Number, default: 0},
        //기타 거점 고유 속성 (예: scoreValue, defense)
    }
}, {collection: 'mapStaticData'});

//조회 속도 최적화를 위한 복합 인덱스 설정
mapStaticSchema.index({globalX: 1, globalY: 1}, {unique: true});

module.exports = mongoose.model('MapStaticData', mapStaticSchema);