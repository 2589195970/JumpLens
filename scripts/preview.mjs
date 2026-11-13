// Local UI verification harness. An explicit fixture path is read-only; saves use a mock bridge.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const fixture = process.argv[2];
const sample = fixture ? await readFile(fixture, 'utf8') : 'package demo;\n\npublic class App {\n    void run(UserService service) {\n        service.load();\n    }\n}\n';
const script = `<script>
window.__calls=[];
let text=${JSON.stringify(sample).replaceAll('<', '\\u003c')}, currentUri=${JSON.stringify(pathToFileURL(fixture ?? '/demo/App.java').href)}, chosenPath='';
const listeners=[];
const range={start:{line:2,character:15},end:{line:2,character:19}};
const targets=['admin','student'].map(module=>({uri:'file:///demo/'+module+'/UserService.java',label:module+'/src/main/java/com/'+module+'/UserService.java',symbol:'load',module,packageName:'com.'+module,signature:'public int load(int id)',range}));
const fileSource=target=>'package '+target.packageName+';\\npublic class UserService {\\n    public int load(int id) { return '+(target.module==='student'?'2':'1')+'; }\\n}';
window.__replaceDoc=value=>{text=value;currentUri=value.includes('class Other')?'file:///demo/Other.java':'file:///demo/App.java';for(const fn of listeners)fn(value)};
window.orca={settings:{get:async()=>({syntaxPalette:'onedark'}),set:async()=>{},onDidChange:()=>({dispose(){}})},document:{session:async()=>({get value(){return text},readOnly:false,change(value){text=value},flush:async()=>{},onReplace:fn=>{listeners.push(fn);return{dispose(){}}},dispose(){}})},plugin:{on:()=>({dispose(){}}),request:async(name,input)=>{
window.__calls.push({name,input});
if(name==='attach'){
if(new URLSearchParams(location.search).has('duplicates')&&!input.path&&!chosenPath)return{candidates:targets.map(t=>({path:t.uri.slice(7),label:t.label}))};
if(input.path)chosenPath=input.path;
return{uri:chosenPath?'file://'+chosenPath:currentUri,path:chosenPath||currentUri.slice(7),root:'/demo'};
}
if(name==='semantic')return[];
if(name==='history-state')return{back:false,forward:false};
if(name==='navigate')return{targets:input.kind==='implementation'||input.kind==='references'?targets:[targets[0]],kind:input.kind};
if(name==='files'){const list=targets.filter(t=>(t.label+' '+t.packageName).toLowerCase().includes(input.query.toLowerCase()));return{targets:list,total:list.length};}
if(name==='preview'||name==='preview-source'){
const target=targets.find(t=>t.uri===input.uri||t.uri.slice(7)===input.path)||targets[0];
await new Promise(r=>setTimeout(r,target.module==='admin'?120:10));
return{text:fileSource(target),firstLine:0,range:target.range,path:target.label};
}
if(name==='open'){const target=targets.find(t=>t.uri===input.uri);window.__opened=input.uri;return{virtual:true,text:fileSource(target),label:target.label,range:target.range};}
return{ok:true};
}}};
</script>`;
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/'){
      const html=(await readFile('dist/editor.html','utf8')).replace('<script type="module"',script+'<script type="module"').replace('</style>',':root{--orca-background:#1e1e1e;--orca-foreground:#d4d4d4;--orca-card:#252526;--orca-popover:#252526;--orca-popover-foreground:#d4d4d4;--orca-muted:#282828;--orca-muted-foreground:#a1a1a1;--orca-border:#454545;--orca-primary:#69b4ff;--orca-accent:#343f50;--orca-ring:#69b4ff;--orca-destructive:#f48771}</style>');
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);
    }else if(['/editor.js', '/picker.css', '/style.css', '/palette.css'].includes(url.pathname)){
      res.writeHead(200,{'Content-Type':url.pathname.endsWith('.css')?'text/css':'text/javascript'});res.end(await readFile('dist'+url.pathname));
    }else{res.writeHead(404);res.end();}
  }catch(error){res.writeHead(500);res.end(String(error));}
});
server.listen(18739,'127.0.0.1',()=>console.log('http://127.0.0.1:18739'));
