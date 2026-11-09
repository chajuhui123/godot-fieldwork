const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const courses=require('../src/data/courses.json'),lessons=courses.flatMap(c=>c.lessons);
const data=require('../src/data/depth.json'),ui={...require('../work/curriculum/models.mjs'),...require('../src/data/optionOrder.ts')};
test('every curriculum lesson has concepts, valid activities and an editor transfer task',()=>{
 assert.equal(lessons.length,65);assert.equal(new Set(lessons.map(l=>l.id)).size,65);
 assert.deepEqual(Object.keys(data).sort(),Array.from(lessons,l=>l.id).sort());
 for(const l of lessons){const d=data[l.id];for(const key of ['concept','trap','task'])assert.ok(d[key].length>15,l.id+': '+key);assert.equal(d.lab.fields.length,2);for(const f of d.lab.fields){assert.ok(f.options.length>=2);assert.ok(f.options[f.answer],l.id);assert.ok(f.why.length>10)}assert.equal(d.challenge.correct.length,2);assert.equal(d.challenge.incorrect.length,2);assert.equal(new Set([...d.challenge.correct,...d.challenge.incorrect]).size,4);assert.ok(l.quiz.options[l.quiz.answer]);if(l.practice.type==='choice')assert.ok(l.practice.options[l.practice.answer]);assert.ok(!l.docs.includes('/4.x/'));}
});
test('advanced option order is stable but not the same for every lesson',()=>{
 const orders=lessons.map(l=>Array.from(ui.optionOrder(l.id)));for(let i=0;i<orders.length;i++){assert.deepEqual([...orders[i]].sort(),[0,1,2,3]);assert.deepEqual(orders[i],Array.from(ui.optionOrder(lessons[i].id)))}assert.ok(new Set(orders.map(x=>x.join())).size>=4);
});
test('delta-based displacement remains 240px across all supported FPS',()=>{for(const fps of ['0','1','2'])assert.match(ui.model('delta-motion',['1',fps]),/1초 뒤 240 px/);assert.match(ui.model('delta-motion',['0','0']),/1초 뒤 120 px/);assert.match(ui.model('delta-motion',['0','2']),/1초 뒤 480 px/)});
test('right anchoring retains 24px gap at narrow and wide sizes',()=>{for(const width of [320,640,960])assert.match(ui.model('ui',['1','0'],width),/오른쪽 여백 24px/);assert.match(ui.model('ui',['0','0'],640),/오른쪽 여백 664px/)});
test('linear timeline interpolates endpoints and midpoint',()=>{for(const t of [0,.5,1])assert.ok(ui.model('animation-player',['1','1'],t).includes('X = '+t*200))});
test('shared resource edit propagates, independent edit does not',()=>{assert.match(ui.model('custom-resource',['0','1']),/Enemy B<\/dt><dd>20/);assert.match(ui.model('custom-resource',['1','1']),/Enemy B<\/dt><dd>10/)});
test('collision requires both matching mask and monitoring',()=>{assert.match(ui.model('collision-areas',['1','1']),/→ 감지/);for(const v of [['0','1'],['1','0'],['0','0']])assert.match(ui.model('collision-areas',v),/감지 안 됨/)});
test('SFX control leaves Music alone, Master affects both',()=>{assert.match(ui.model('audio-buses',['1','2']),/효과음: 작아짐 \/ 음악\(Music\): 유지/);assert.match(ui.model('audio-buses',['1','0']),/효과음: 작아짐 \/ 음악\(Music\): 작아짐/)});
test('legacy malformed choices have three independent buttons and reachable answers',()=>{for(const id of ['builds','first-3d-loop','groups-autoload','3d-transforms']){const l=lessons.find(x=>x.id===id);assert.equal(l.practice.options.length,3);assert.equal(l.practice.options[l.practice.answer].length,2)}});
test('main loop no longer teaches a single mandatory callback sequence',()=>{const l=lessons.find(x=>x.id==='loop');assert.equal(l.practice.type,'choice');assert.equal(l.practice.options[l.practice.answer][0],'_physics_process()')});
test('advanced modules contain six lessons each with reachable prerequisite links',()=>{for(const m of courses.slice(3)){assert.equal(m.lessons.length,6);for(const l of m.lessons){assert.ok(l.prerequisites.length);for(const [id] of l.prerequisites)assert.ok(lessons.some(x=>x.id===id),id)}}});
test('projection model distinguishes perspective and orthographic scale',()=>{assert.match(ui.model('camera-projection',['0','1']),/높이 비 2:1/);assert.match(ui.model('camera-projection',['1','1']),/높이 비 1:1/)});
test('dissolve threshold removes more samples for less-than comparison',()=>{const count=(a,b)=>Number(ui.model('shader-dissolve',[String(a),String(b)]).match(/남은 셀 (\d+)/)[1]);assert.ok(count(0,0)>count(1,0));assert.ok(count(1,0)>count(2,0));assert.ok(count(0,1)<count(2,1))});
test('Fresnel endpoint and midpoint values follow the stated approximation',()=>{assert.match(ui.model('shader-fresnel',['0','1']),/= 1.000/);assert.match(ui.model('shader-fresnel',['1','1']),/= 0.250/);assert.match(ui.model('shader-fresnel',['2','1']),/= 0.000/)});
test('particle emission and compute bounds arithmetic are correct',()=>{assert.match(ui.model('gpu-particles',['1','1']),/평균 60개/);assert.match(ui.model('compute-shaders',['1','0']),/1,024개 호출/);assert.match(ui.model('compute-shaders',['1','0']),/초과 호출 24개/);assert.match(ui.model('compute-shaders',['0','0']),/미처리 40개/)});
