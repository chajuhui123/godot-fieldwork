const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const workshop={lessons:require('../src/data/core-workshops.json'),...require('../src/workshop/projects.ts')};
test('six core workshops export editable code, Godot scene and clear GUI tasks',()=>{
 assert.equal(Object.keys(workshop.lessons).length,6);
 for(const [id,l] of Object.entries(workshop.lessons)){
  const files=workshop.files(id,'# learner code\nextends Node2D\n');
  assert.equal(files['main.gd'],'# learner code\nextends Node2D\n');
  assert.match(files['project.godot'],/gl_compatibility/);
  assert.equal(l.steps.length,4);assert.equal(l.checks.length,2);
  assert.match(l.starter,/TODO/);
 }
});
test('starter requires GUI assembly while reference includes it',()=>{
 assert.doesNotMatch(workshop.files('nodes','')['main.tscn'],/name="Beacon"/);
 assert.match(workshop.files('nodes','',true)['main.tscn'],/name="Beacon"/);
 assert.doesNotMatch(workshop.files('signals','')['main.tscn'],/\[connection/);
 assert.match(workshop.files('signals','',true)['main.tscn'],/\[connection/);
 assert.doesNotMatch(workshop.files('attach-script','')['main.tscn'],/script =/);
 assert.match(workshop.files('attach-script','',true)['main.tscn'],/script =/);
});
test('ZIP is readable and preserves UTF-8 learner code',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fieldwork-zip-'));
 try{fs.writeFileSync(path.join(dir,'test.zip'),Buffer.from(await workshop.zip({'main.gd':'# 한글\nextends Node2D\n'}).arrayBuffer()));
 const result=spawnSync('python3',['-c','import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert z.read("main.gd").decode()=="# 한글\\nextends Node2D\\n"',path.join(dir,'test.zip')],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
const godot=process.env.FIELDWORK_GODOT;
test('Godot executes all starter and reference projects and verifies lesson outcomes',{skip:!godot},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fieldwork-engine-test-'));
 try{for(const [id,l] of Object.entries(workshop.lessons))for(const complete of [false,true]){
  const project=path.join(dir,`${id}-${complete}`);fs.mkdirSync(project);
  for(const [name,text] of Object.entries(workshop.files(id,complete?l.solution:l.starter,complete)))fs.writeFileSync(path.join(project,name),text);
  let checks='';
  if(complete){
   if(id==='editor')checks='assert(scene.get_node("Player").position == Vector2(480, 180))';
   if(id==='nodes')checks='assert(scene.get_node("Player/Beacon").global_position == Vector2(200, 180))';
   if(id==='attach-script')checks='assert(scene.get_node("Status").text == "첫 스크립트 실행!")\n\tassert(scene.get_node("Player/Shape").color.is_equal_approx(Color(1.0, 0.6, 0.2)))';
   if(id==='signals')checks='await create_timer(1.1).timeout\n\tassert(scene.score == 1)\n\tassert(scene.get_node("Status").text == "Score: 1")';
   if(id==='delta-motion')checks='scene.set_process(false)\n\tscene.elapsed = 0.0\n\tscene.get_node("Player").position.x = 120.0\n\tfor frame in range(120):\n\t\tscene._process(1.0 / 60.0)\n\tassert(is_equal_approx(scene.get_node("Player").position.x, 360.0))';
   if(id==='input-events')checks='scene.set_process(false)\n\tInput.action_press("ui_right")\n\tscene._process(1.0)\n\tInput.action_release("ui_right")\n\tassert(is_equal_approx(scene.get_node("Player").position.x, 240.0))\n\tscene._process(1.0)\n\tassert(is_equal_approx(scene.get_node("Player").position.x, 240.0))';
  }
  fs.writeFileSync(path.join(project,'verify.gd'),`extends SceneTree\n\nfunc _initialize() -> void:\n\tcall_deferred("verify")\n\nfunc verify() -> void:\n\tvar scene = load("res://main.tscn").instantiate()\n\troot.add_child(scene)\n\tawait process_frame\n\t${checks||'assert(scene.get_node("Player") != null)'}\n\tprint("WORKSHOP_PASS")\n\tquit()\n`);
  const result=spawnSync(godot,['--headless','--log-file',path.join(project,'engine.log'),'--path',project,'--script','res://verify.gd'],{encoding:'utf8',timeout:20000});
  assert.equal(result.status,0,`${id}/${complete}: ${result.stderr}`);assert.doesNotMatch(result.stderr,/SCRIPT ERROR|Parse Error|Assertion failed/);assert.match(result.stdout,/WORKSHOP_PASS/);
 }}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
