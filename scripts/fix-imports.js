const fs = require('fs');
const path = require('path');

const files = [
  'server/api/slack/events.post.ts',
  'server/lib/ai/tools.ts',
  'server/lib/ai/workflows/chat.ts',
  'server/listeners/actions/channel-join-approval.ts',
  'server/listeners/actions/index.ts',
  'server/listeners/assistant/assistantUserMessage.ts',
  'server/listeners/events/app-mention.ts',
];

const replacements = {
  'server/api/slack/events.post.ts': {
    'from "#app"': 'from "../../app"',
  },
  'server/lib/ai/tools.ts': {
    'from "#lib/ai/context"': 'from "./context"',
    'from "#lib/ai/workflows/hooks"': 'from "./workflows/hooks"',
  },
  'server/lib/ai/workflows/chat.ts': {
    'from "#lib/ai/agent"': 'from "../agent"',
    'from "#lib/ai/context"': 'from "../context"',
  },
  'server/listeners/actions/channel-join-approval.ts': {
    'from "#lib/ai/workflows/hooks"': 'from "../../lib/ai/workflows/hooks"',
  },
  'server/listeners/actions/index.ts': {
    'from "#lib/slack/blocks"': 'from "../../lib/slack/blocks"',
  },
  'server/listeners/assistant/assistantUserMessage.ts': {
    'from "#lib/ai/workflows/chat"': 'from "../../lib/ai/workflows/chat"',
    'from "#lib/slack/client"': 'from "../../lib/slack/client"',
    'from "#lib/slack/utils"': 'from "../../lib/slack/utils"',
  },
  'server/listeners/events/app-mention.ts': {
    'from "#lib/ai/workflows/chat"': 'from "../../lib/ai/workflows/chat"',
    'from "#lib/slack/blocks"': 'from "../../lib/slack/blocks"',
    'from "#lib/slack/client"': 'from "../../lib/slack/client"',
    'from "#lib/slack/utils"': 'from "../../lib/slack/utils"',
  },
};

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (replacements[file]) {
    Object.entries(replacements[file]).forEach(([from, to]) => {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    });

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('\n🎉 All imports fixed!');
