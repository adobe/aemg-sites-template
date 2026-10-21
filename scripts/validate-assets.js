const fs = require('fs');
const path = require('path');

const damRoot = path.join(
    __dirname,
    '..',
    'site',
    'src',
    'main',
    'content',
    'jcr_root',
    'content',
    'dam',
    'aemg-docs',
);

const requiredAssets = [
    'fm-trending-1.png',
    'fm-trending-2.png',
    'fm-trending-3.png',
    'framemaker-logo.png',
    'framemaker-topic-thumbnail.png',
];

const forbiddenAssets = [
    'cf.png',
    'rh-trending-1.png',
    'rh-trending-2.png',
    'rh-trending-3.png',
    'robohelp-topic-thumbnail.png',
    'trending-1.png',
    'trending-2.png',
    'trending-3.png',
];

const forbiddenIdentityPattern = /\b(?:jcr:uuid|fmUuid|fmPostProcessedAt)=/;
const sourceContentLinkPattern = /\/content\/dam\/framemaker\/en\//;
const flatFrameMakerTopicLinkPattern =
    /\/content\/framemaker-docs\/en\/docs\/user-guide\/frm_[^/"'<\s]+\.html/;
const xmlFrameMakerTopicLinkPattern =
    /\/content\/framemaker-docs\/en\/docs\/user-guide\/[^"'<\s]+\.xml\.html/;
const errors = [];

function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            walk(entryPath);
        } else if (entry.name === '.content.xml') {
            const content = fs.readFileSync(entryPath, 'utf8');
            if (forbiddenIdentityPattern.test(content)) {
                errors.push(`Fixed DAM identity in ${path.relative(damRoot, entryPath)}`);
            }
        }
    }
}

for (const asset of requiredAssets) {
    const original = path.join(damRoot, asset, '_jcr_content', 'renditions', 'original');
    if (!fs.existsSync(original)) {
        errors.push(`Missing required FrameMaker asset: ${asset}`);
    }
}

for (const asset of forbiddenAssets) {
    if (fs.existsSync(path.join(damRoot, asset))) {
        errors.push(`Inherited product asset must not be packaged: ${asset}`);
    }
}

walk(damRoot);

const contentRoot = path.join(
    __dirname,
    '..',
    'site',
    'src',
    'main',
    'content',
    'jcr_root',
);

function validateContentLinks(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            validateContentLinks(entryPath);
        } else if (entry.name === '.content.xml') {
            const content = fs.readFileSync(entryPath, 'utf8');
            if (sourceContentLinkPattern.test(content)) {
                errors.push(
                    `DAM source path used as a browser link: ${path.relative(contentRoot, entryPath)}`,
                );
            }
            if (flatFrameMakerTopicLinkPattern.test(content)) {
                errors.push(
                    `FrameMaker topic link is missing its map hierarchy: ${path.relative(contentRoot, entryPath)}`,
                );
            }
            if (xmlFrameMakerTopicLinkPattern.test(content)) {
                errors.push(
                    `FrameMaker topic link retains its source extension: ${path.relative(contentRoot, entryPath)}`,
                );
            }
        }
    }
}

validateContentLinks(contentRoot);

if (errors.length) {
    console.error(`Asset validation failed:\n- ${errors.join('\n- ')}`);
    process.exit(1);
}

console.log('Asset validation passed.');
