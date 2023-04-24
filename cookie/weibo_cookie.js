const https = require('https')

const getcookie = async function() {
    return new Promise(async(resolve,reject)=>{
        let a='incarnate'
    let cb='cross_domain'
    let from='weibo'
    let t;
    let w;
    let c=100
    let obj=await getTid()
if(obj.retcode==20000000){
    t=obj.data.tid
    w=obj.data.new_tid==true ? 3:2
}
    https.get(`https://passport.weibo.com/visitor/visitor?t=${t}&w=${w}&a=${a}&cb=${cb}&from=${from}&c=${c}`,(res)=>{
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {    
                rawData= rawData.replaceAll("window.cross_domain && cross_domain(", "");
                rawData=rawData.replaceAll(");", ""); 
                let obj=JSON.parse(rawData)
                resolve(obj)                                
            } catch (e) {
              console.error(e.message);
            }
          });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        throw new Error(e.message)
      });
    })
    
    
}

async function getTid(){
    return new Promise((resolve,reject)=>{
        https.get('https://passport.weibo.com/visitor/genvisitor?cb=gen_callback&fp={"os":"1","browser":"Chrome70,0,3538,25","fonts":"undefined","screenInfo":"1920*1080*24","plugins":"Portable Document Format::internal-pdf-viewer::Chromium PDF Plugin|::mhjfbmdgcfjbbpaeojofohoefgiehjai::Chromium PDF Viewer|::gbkeegbaiigmenfmjfclcdgdpimamgkj::Google文档、表格及幻灯片的Office编辑扩展程序|::internal-nacl-plugin::Native Client"}'
    ,(res)=>{
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {                           
                rawData= rawData.replaceAll("window.gen_callback && gen_callback(", "");
                rawData=rawData.replaceAll(");", "");
                let obj=JSON.parse(rawData)
                console.log(obj);
                resolve(obj) ;         
            } catch (e) {
              console.error(e.message);
            }
          });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        throw new Error(e.message)
      });
    })
}
module.exports =getcookie