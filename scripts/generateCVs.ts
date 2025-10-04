import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { CohereClient } from 'cohere-ai';

dotenv.config({ path: '.env.local' });

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY!,
});

if (!process.env.COHERE_API_KEY) {
    console.error('❌ ERROR: COHERE_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('✓ Cohere API Key loaded successfully');
console.log('✓ Using model: command-a-03-2025 (latest)\n');

const languages = ['English', 'Spanish', 'French', 'German', 'Italian'];

const roles = [
    'iOS Developer',
    'Android Developer',
    'Full Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'Data Scientist',
    'DevOps Engineer',
];

const skills = {
    ios: ['Swift', 'Objective-C', 'UIKit', 'SwiftUI', 'CoreData', 'Xcode'],
    android: ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'Room'],
    frontend: ['React', 'Vue.js', 'TypeScript', 'HTML', 'CSS'],
    backend: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'REST API'],
    data: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'SQL'],
    devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateCV(index: number, retries = 3): Promise<void> {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];

    let skillSet: string[] = [];
    if (role.includes('iOS')) {
        skillSet = skills.ios;
    } else if (role.includes('Android')) {
        skillSet = skills.android;
    } else if (role.includes('Frontend')) {
        skillSet = skills.frontend;
    } else if (role.includes('Backend') || role.includes('Full Stack')) {
        skillSet = [...skills.backend, ...skills.frontend].slice(0, 6);
    } else if (role.includes('Data')) {
        skillSet = skills.data;
    } else if (role.includes('DevOps')) {
        skillSet = skills.devops;
    } else {
        skillSet = skills.frontend;
    }

    const prompt = `Generate a realistic CV/Resume in ${language} for a ${role} with ${Math.floor(Math.random() * 5) + 2} years of experience. 

Include: Name, contact, professional summary, 2 work positions, technical skills (${skillSet.join(', ')}), and education. Keep it under 400 words. Use ONLY ${language} language except for technical terms.`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await cohere.chat({
                message: prompt,
                model: 'command-a-03-2025', // ✅ Updated to latest model
            });

            const cvContent = response.text;

            const cvsDir = path.join(process.cwd(), 'data', 'cvs');
            if (!fs.existsSync(cvsDir)) {
                fs.mkdirSync(cvsDir, { recursive: true });
            }

            const filename = `cv_${String(index).padStart(3, '0')}_${language.toLowerCase()}_${role.replace(/\s+/g, '_').toLowerCase()}.txt`;
            const filepath = path.join(cvsDir, filename);

            fs.writeFileSync(filepath, cvContent, 'utf-8');

            console.log(`✓ [${index}/100] ${filename}`);
            return; // Success!

        } catch (error: any) {
            if (error.statusCode === 429 && attempt < retries) {
                console.log(`⚠️  Rate limit hit for CV ${index}. Waiting 60 seconds... (Attempt ${attempt}/${retries})`);
                await sleep(60000);
            } else {
                console.error(`✗ [${index}/100] Failed: ${error.message || error}`);
                return;
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting CV generation with rate limit handling...\n');

    const totalCVs = 100;
    const delayBetweenCalls = 7000; // 7 seconds

    for (let i = 0; i < totalCVs; i++) {
        await generateCV(i + 1);

        if (i < totalCVs - 1) {
            if ((i + 1) % 10 === 0) {
                console.log(`\n📊 Progress: ${i + 1}/${totalCVs} CVs generated`);
                console.log(`⏳ Waiting 7 seconds before next batch...\n`);
            }
            await sleep(delayBetweenCalls);
        }
    }

    const cvsDir = path.join(process.cwd(), 'data', 'cvs');
    if (fs.existsSync(cvsDir)) {
        const files = fs.readdirSync(cvsDir).filter(f => f.endsWith('.txt'));
        console.log(`\n✅ Successfully generated ${files.length}/${totalCVs} CVs!`);
        console.log(`📂 Location: ${cvsDir}`);
    }
}

main();