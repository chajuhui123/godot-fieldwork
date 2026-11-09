const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const lessons=require('../src/data/core-workshops.json');
const godot=process.env.FIELDWORK_GODOT;
test('embedded runtime grades actual nodes for all six solutions and rejects unfinished code',{skip:!godot},()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fieldwork-runtime-test-'));
 try{
 fs.copyFileSync('runtime-src/frog.json',path.join(dir,'frog.json'));
 fs.copyFileSync('runtime-src/runtime.gd',path.join(dir,'runtime.gd'));
 fs.writeFileSync(path.join(dir,'project.godot'),'config_version=5\n[application]\nconfig/name="Runtime Test"\nrun/main_scene="res://verify.tscn"\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n');
 const jobs=[];
 for(const [id,l] of Object.entries(lessons))for(const solution of [false,true])jobs.push({lesson:id,code:solution?l.solution:l.starter,check:true,run:jobs.length+1,shouldPass:solution,config:{x:id==='editor'?320:120,y:180,beacon:solution&&id==='nodes',beacon_x:80,attached:solution||id!=='attach-script',autostart:solution,connected:solution,wait:1}});
 fs.writeFileSync(path.join(dir,'cases.json'),JSON.stringify(jobs));
 fs.writeFileSync(path.join(dir,'verify.tscn'),'[gd_scene load_steps=2 format=3]\n[ext_resource type="Script" path="res://verify.gd" id="1"]\n[node name="Verify" type="Node"]\nscript = ExtResource("1")\n');
 fs.writeFileSync(path.join(dir,'verify.gd'),`extends "res://runtime.gd"\nvar result: Dictionary = {}\nfunc send(data: Dictionary) -> void:\n\tif data.get("type", "") == "result":\n\t\tresult = data\nfunc _ready() -> void:\n\tcall_deferred("verify")\nfunc verify() -> void:\n\tvar jobs = JSON.parse_string(FileAccess.get_file_as_string("res://cases.json"))\n\tfor job in jobs:\n\t\tresult = {}\n\t\tstart(job)\n\t\tawait get_tree().create_timer(2.4).timeout\n\t\tassert(result.has("tests"))\n\t\tvar passed = true\n\t\tfor check in result.tests:\n\t\t\tpassed = passed and check["pass"]\n\t\t\tassert(check.has("expected") and check.has("actual") and not check.hint.is_empty())\n\t\tif job.lesson == "editor":\n\t\t\tassert(float(result.tests[0].actual.trim_suffix(" px")) == 320.0)\n\t\t\tassert(float(result.tests[1].actual.trim_suffix(" px")) == (480.0 if job.shouldPass else 320.0))\n\t\tassert(passed == job.shouldPass, job.lesson + " unexpected grading")\n\t\tprint("CASE_PASS ", job.lesson, " ", job.shouldPass)\n\tprint("RUNTIME_PASS")\n\tget_tree().quit()\n`);
 const result=spawnSync(godot,['--headless','--log-file',path.join(dir,'engine.log'),'--path',dir],{encoding:'utf8',timeout:45000});
 assert.equal(result.status,0,result.stderr);assert.doesNotMatch(result.stderr,/SCRIPT ERROR|Parse Error|Assertion failed/);assert.match(result.stdout,/RUNTIME_PASS/);assert.equal((result.stdout.match(/CASE_PASS/g)||[]).length,12);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
