const fs=require('fs'),path=require('path');const e=path.join(__dirname,'..','.env.local');for(const l of fs.readFileSync(e,'utf8').split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^"|"$/g,'')}
const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
(async()=>{await p.$executeRawUnsafe('ALTER TABLE "RecruiterProfile" ADD COLUMN IF NOT EXISTS "website" TEXT');console.log('ok');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})
