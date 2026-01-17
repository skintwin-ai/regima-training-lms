/**
 * SCORM Service
 * 
 * Generates SCORM 1.2 and 2004 compliant packages from RegimA Training content.
 * Supports export of modules and lessons as standalone SCORM packages.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import type { SCORMManifest, SCORMOrganization, SCORMItem, SCORMResource } from '@shared/lms-types';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface LessonData {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  steps: Array<{ id: number; title: string; description: string; order: number }>;
  resources: Array<{ id: number; title: string; type: string; url: string }>;
  quiz?: {
    id: number;
    questions: Array<{
      id: string;
      question: string;
      options: Array<{ id: string; text: string }>;
      correctOptionId: string;
    }>;
  };
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  lessons: LessonData[];
}

export class SCORMService {
  private version: '1.2' | '2004';
  private outputDir: string;

  constructor(version: '1.2' | '2004' = '2004', outputDir: string = '/tmp/scorm-packages') {
    this.version = version;
    this.outputDir = outputDir;
  }

  /**
   * Generate SCORM manifest XML
   */
  private generateManifest(manifest: SCORMManifest): string {
    const schemaVersion = this.version === '1.2' ? '1.2' : '2004 4th Edition';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="${manifest.version}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${schemaVersion}</schemaversion>
  </metadata>
  
  <organizations default="${manifest.organizations[0]?.identifier || 'default-org'}">`;

    for (const org of manifest.organizations) {
      xml += `
    <organization identifier="${org.identifier}">
      <title>${this.escapeXml(org.title)}</title>`;
      
      for (const item of org.items) {
        xml += this.generateItemXml(item, 3);
      }
      
      xml += `
    </organization>`;
    }

    xml += `
  </organizations>
  
  <resources>`;

    for (const resource of manifest.resources) {
      xml += `
    <resource identifier="${resource.identifier}" type="${resource.type}" href="${resource.href}" adlcp:scormtype="sco">`;
      
      for (const file of resource.files) {
        xml += `
      <file href="${file}"/>`;
      }
      
      xml += `
    </resource>`;
    }

    xml += `
  </resources>
</manifest>`;

    return xml;
  }

  /**
   * Generate XML for a SCORM item (recursive for nested items)
   */
  private generateItemXml(item: SCORMItem, indent: number): string {
    const spaces = '  '.repeat(indent);
    let xml = `
${spaces}<item identifier="${item.identifier}"${item.identifierref ? ` identifierref="${item.identifierref}"` : ''}>
${spaces}  <title>${this.escapeXml(item.title)}</title>`;

    if (item.children) {
      for (const child of item.children) {
        xml += this.generateItemXml(child, indent + 1);
      }
    }

    xml += `
${spaces}</item>`;

    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate SCORM API wrapper JavaScript
   */
  private generateAPIWrapper(): string {
    if (this.version === '1.2') {
      return `
// SCORM 1.2 API Wrapper
var API = null;

function findAPI(win) {
  var findAPITries = 0;
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    if (findAPITries > 7) return null;
    win = win.parent;
  }
  return win.API;
}

function getAPI() {
  if (API == null) {
    API = findAPI(window);
    if (API == null && window.opener != null) {
      API = findAPI(window.opener);
    }
  }
  return API;
}

function doLMSInitialize() {
  var api = getAPI();
  if (api == null) {
    console.log("Unable to locate the LMS API");
    return "false";
  }
  return api.LMSInitialize("");
}

function doLMSFinish() {
  var api = getAPI();
  if (api == null) return "false";
  return api.LMSFinish("");
}

function doLMSGetValue(name) {
  var api = getAPI();
  if (api == null) return "";
  return api.LMSGetValue(name);
}

function doLMSSetValue(name, value) {
  var api = getAPI();
  if (api == null) return "false";
  return api.LMSSetValue(name, value);
}

function doLMSCommit() {
  var api = getAPI();
  if (api == null) return "false";
  return api.LMSCommit("");
}

// Initialize on load
window.onload = function() {
  doLMSInitialize();
  doLMSSetValue("cmi.core.lesson_status", "incomplete");
};

// Finish on unload
window.onunload = function() {
  doLMSFinish();
};

// Helper functions
function setComplete() {
  doLMSSetValue("cmi.core.lesson_status", "completed");
  doLMSCommit();
}

function setScore(score, max) {
  doLMSSetValue("cmi.core.score.raw", score);
  doLMSSetValue("cmi.core.score.max", max);
  doLMSSetValue("cmi.core.score.min", "0");
  if (score >= (max * 0.7)) {
    doLMSSetValue("cmi.core.lesson_status", "passed");
  } else {
    doLMSSetValue("cmi.core.lesson_status", "failed");
  }
  doLMSCommit();
}
`;
    } else {
      return `
// SCORM 2004 API Wrapper
var API_1484_11 = null;

function findAPI(win) {
  var findAPITries = 0;
  while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    if (findAPITries > 7) return null;
    win = win.parent;
  }
  return win.API_1484_11;
}

function getAPI() {
  if (API_1484_11 == null) {
    API_1484_11 = findAPI(window);
    if (API_1484_11 == null && window.opener != null) {
      API_1484_11 = findAPI(window.opener);
    }
  }
  return API_1484_11;
}

function doInitialize() {
  var api = getAPI();
  if (api == null) {
    console.log("Unable to locate the LMS API");
    return "false";
  }
  return api.Initialize("");
}

function doTerminate() {
  var api = getAPI();
  if (api == null) return "false";
  return api.Terminate("");
}

function doGetValue(name) {
  var api = getAPI();
  if (api == null) return "";
  return api.GetValue(name);
}

function doSetValue(name, value) {
  var api = getAPI();
  if (api == null) return "false";
  return api.SetValue(name, value);
}

function doCommit() {
  var api = getAPI();
  if (api == null) return "false";
  return api.Commit("");
}

// Initialize on load
window.onload = function() {
  doInitialize();
  doSetValue("cmi.completion_status", "incomplete");
  doSetValue("cmi.success_status", "unknown");
};

// Terminate on unload
window.onunload = function() {
  doTerminate();
};

// Helper functions
function setComplete() {
  doSetValue("cmi.completion_status", "completed");
  doCommit();
}

function setScore(score, max) {
  doSetValue("cmi.score.raw", score);
  doSetValue("cmi.score.max", max);
  doSetValue("cmi.score.min", "0");
  doSetValue("cmi.score.scaled", (score / max).toFixed(2));
  if (score >= (max * 0.7)) {
    doSetValue("cmi.success_status", "passed");
  } else {
    doSetValue("cmi.success_status", "failed");
  }
  doSetValue("cmi.completion_status", "completed");
  doCommit();
}

function setProgress(progress) {
  doSetValue("cmi.progress_measure", (progress / 100).toFixed(2));
  doCommit();
}
`;
    }
  }

  /**
   * Generate HTML content for a lesson
   */
  private generateLessonHTML(lesson: LessonData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeXml(lesson.title)}</title>
  <script src="scorm-api.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 1.8rem;
    }
    .description {
      color: #666;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .content {
      margin-bottom: 30px;
    }
    .video-container {
      margin: 20px 0;
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
    }
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .steps {
      margin: 30px 0;
    }
    .step {
      background: #f8f9fa;
      padding: 15px 20px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }
    .step-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    .resources {
      margin: 30px 0;
    }
    .resource {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background: #e8f4fd;
      margin: 8px 0;
      border-radius: 4px;
    }
    .resource a {
      color: #2980b9;
      text-decoration: none;
    }
    .quiz-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #eee;
    }
    .question {
      background: #f8f9fa;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
    }
    .question-text {
      font-weight: 600;
      margin-bottom: 15px;
    }
    .option {
      display: block;
      padding: 10px 15px;
      margin: 8px 0;
      background: white;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .option:hover {
      border-color: #3498db;
      background: #f0f7ff;
    }
    .option.selected {
      border-color: #3498db;
      background: #e8f4fd;
    }
    .option.correct {
      border-color: #27ae60;
      background: #d4edda;
    }
    .option.incorrect {
      border-color: #e74c3c;
      background: #f8d7da;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 20px;
    }
    .btn:hover {
      background: #2980b9;
    }
    .btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    .complete-btn {
      background: #27ae60;
    }
    .complete-btn:hover {
      background: #219a52;
    }
    .score-display {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 20px;
    }
    .score {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${this.escapeXml(lesson.title)}</h1>
    <p class="description">${this.escapeXml(lesson.description)}</p>
    
    <div class="content">
      ${lesson.content}
    </div>
    
    ${lesson.videoUrl ? `
    <div class="video-container">
      <iframe src="${lesson.videoUrl}" frameborder="0" allowfullscreen></iframe>
    </div>
    ` : ''}
    
    ${lesson.steps.length > 0 ? `
    <div class="steps">
      <h2>Steps</h2>
      ${lesson.steps.map((step, i) => `
        <div class="step">
          <div class="step-title">Step ${i + 1}: ${this.escapeXml(step.title)}</div>
          <div>${this.escapeXml(step.description)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${lesson.resources.length > 0 ? `
    <div class="resources">
      <h2>Resources</h2>
      ${lesson.resources.map(r => `
        <div class="resource">
          <a href="${r.url}" target="_blank">${this.escapeXml(r.title)} (${r.type})</a>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${lesson.quiz ? `
    <div class="quiz-section" id="quiz">
      <h2>Knowledge Check</h2>
      <form id="quiz-form">
        ${lesson.quiz.questions.map((q, qi) => `
          <div class="question" data-question="${qi}" data-correct="${q.correctOptionId}">
            <div class="question-text">${qi + 1}. ${this.escapeXml(q.question)}</div>
            ${q.options.map(o => `
              <label class="option" data-option="${o.id}">
                <input type="radio" name="q${qi}" value="${o.id}" style="margin-right: 10px;">
                ${this.escapeXml(o.text)}
              </label>
            `).join('')}
          </div>
        `).join('')}
        <button type="button" class="btn" onclick="submitQuiz()">Submit Quiz</button>
      </form>
      <div id="quiz-results" class="score-display hidden">
        <div class="score" id="score-text"></div>
        <p id="score-message"></p>
      </div>
    </div>
    ` : ''}
    
    <button class="btn complete-btn" onclick="markComplete()">Mark as Complete</button>
  </div>
  
  <script>
    var quizSubmitted = false;
    var totalQuestions = ${lesson.quiz?.questions.length || 0};
    
    function submitQuiz() {
      if (quizSubmitted) return;
      quizSubmitted = true;
      
      var score = 0;
      var questions = document.querySelectorAll('.question');
      
      questions.forEach(function(q) {
        var correctId = q.dataset.correct;
        var selected = q.querySelector('input:checked');
        var options = q.querySelectorAll('.option');
        
        options.forEach(function(opt) {
          if (opt.dataset.option === correctId) {
            opt.classList.add('correct');
          }
        });
        
        if (selected) {
          var selectedOption = selected.closest('.option');
          if (selected.value === correctId) {
            score++;
          } else {
            selectedOption.classList.add('incorrect');
          }
        }
      });
      
      var percentage = Math.round((score / totalQuestions) * 100);
      document.getElementById('score-text').textContent = score + ' / ' + totalQuestions + ' (' + percentage + '%)';
      document.getElementById('score-message').textContent = percentage >= 70 ? 'Great job! You passed!' : 'Keep studying and try again.';
      document.getElementById('quiz-results').classList.remove('hidden');
      
      // Report score to LMS
      setScore(score, totalQuestions);
    }
    
    function markComplete() {
      setComplete();
      alert('Lesson marked as complete!');
    }
    
    // Track progress as user scrolls
    var maxScroll = 0;
    window.addEventListener('scroll', function() {
      var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (typeof setProgress === 'function') {
          setProgress(maxScroll);
        }
      }
    });
  </script>
</body>
</html>`;
  }

  /**
   * Generate a SCORM package for a single lesson
   */
  async generateLessonPackage(lesson: LessonData, moduleId: number): Promise<string> {
    const packageId = `regima-lesson-${lesson.id}`;
    const packageDir = path.join(this.outputDir, packageId);

    // Create package directory
    await mkdir(packageDir, { recursive: true });

    // Generate manifest
    const manifest: SCORMManifest = {
      identifier: packageId,
      version: '1.0',
      title: lesson.title,
      description: lesson.description,
      organizations: [{
        identifier: 'org-1',
        title: lesson.title,
        items: [{
          identifier: 'item-1',
          title: lesson.title,
          identifierref: 'res-1',
        }],
      }],
      resources: [{
        identifier: 'res-1',
        type: 'webcontent',
        href: 'index.html',
        files: ['index.html', 'scorm-api.js'],
      }],
    };

    // Write files
    await writeFile(
      path.join(packageDir, 'imsmanifest.xml'),
      this.generateManifest(manifest)
    );

    await writeFile(
      path.join(packageDir, 'scorm-api.js'),
      this.generateAPIWrapper()
    );

    await writeFile(
      path.join(packageDir, 'index.html'),
      this.generateLessonHTML(lesson)
    );

    return packageDir;
  }

  /**
   * Generate a SCORM package for an entire module
   */
  async generateModulePackage(module: ModuleData): Promise<string> {
    const packageId = `regima-module-${module.id}`;
    const packageDir = path.join(this.outputDir, packageId);

    // Create package directory
    await mkdir(packageDir, { recursive: true });

    // Generate items and resources for each lesson
    const items: SCORMItem[] = [];
    const resources: SCORMResource[] = [];
    const files: string[] = ['scorm-api.js'];

    for (const lesson of module.lessons) {
      const lessonFile = `lesson-${lesson.id}.html`;
      
      items.push({
        identifier: `item-${lesson.id}`,
        title: lesson.title,
        identifierref: `res-${lesson.id}`,
      });

      resources.push({
        identifier: `res-${lesson.id}`,
        type: 'webcontent',
        href: lessonFile,
        files: [lessonFile, 'scorm-api.js'],
      });

      files.push(lessonFile);

      // Write lesson HTML
      await writeFile(
        path.join(packageDir, lessonFile),
        this.generateLessonHTML(lesson)
      );
    }

    // Generate manifest
    const manifest: SCORMManifest = {
      identifier: packageId,
      version: '1.0',
      title: module.title,
      description: module.description,
      organizations: [{
        identifier: 'org-1',
        title: module.title,
        items,
      }],
      resources,
    };

    // Write manifest and API wrapper
    await writeFile(
      path.join(packageDir, 'imsmanifest.xml'),
      this.generateManifest(manifest)
    );

    await writeFile(
      path.join(packageDir, 'scorm-api.js'),
      this.generateAPIWrapper()
    );

    return packageDir;
  }

  /**
   * Create a ZIP file from a SCORM package directory
   */
  async createZipPackage(packageDir: string): Promise<string> {
    const archiver = await import('archiver');
    const zipPath = `${packageDir}.zip`;
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver.default('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(zipPath));
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(packageDir, false);
      archive.finalize();
    });
  }
}

// Singleton instance
let scormServiceInstance: SCORMService | null = null;

export function getSCORMService(version?: '1.2' | '2004', outputDir?: string): SCORMService {
  if (!scormServiceInstance) {
    scormServiceInstance = new SCORMService(version, outputDir);
  }
  return scormServiceInstance;
}

export default SCORMService;
