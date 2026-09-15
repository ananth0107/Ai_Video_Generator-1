/**
 * Advanced Semantic Action & Video Generation Prompt Interpreter
 * 
 * Core Principles:
 * 1. The user's prompt is the ONLY source of truth for the video content and actions.
 * 2. Semantically dissects every action, movement, subject, interaction, and sequence.
 * 3. NEVER force zoom-in or zoom-out.
 * 4. NEVER use zoom as the default action.
 * 5. NEVER replace requested actions with camera movement.
 * 6. Multi-action chronological sequence preservation (e.g. Action A -> Action B -> Action C).
 * 7. If no camera movement is mentioned, maintain a stable, clear perspective.
 */

// Camera keywords detection (only activated if explicitly stated by user)
const CAMERA_KEYWORDS = [
  'zoom in', 'zoom out', 'dolly in', 'dolly out', 'pan left', 'pan right',
  'tilt up', 'tilt down', 'drone shot', 'aerial view', 'orbit camera', 'tracking shot',
  'crane shot', 'handheld camera', 'close-up shot', 'wide shot', 'extreme close-up',
  'camera zooms in', 'camera zooms out', 'camera rotates', '360 rotation'
];

/**
 * Clean and split text into distinct action clauses based on chronological markers
 * Supports English and Tanglish/Tamil sequencing (then, and then, after that, aprom, pinbu, etc.)
 */
function extractActionSequence(promptText) {
  if (!promptText || !promptText.trim()) return [];

  const text = promptText.trim();

  // Split on sequence connectors:
  // English: 'and then', 'then', 'after that', 'subsequently', 'next', 'finally', 'and'
  // Tanglish/Tamil: 'aprom', 'apram', 'pinbu', 'aduthu', 'pin'
  // Punctuation: commas, semicolons, full stops, dashes
  const rawSegments = text
    .split(/\s*(?:,\s*and\s+then\s*|\s+and\s+then\s*|\s+then\s*|\s+after\s+that\s*|\s+subsequently\s*|\s+next\s*|\s+finally\s*|\s+aprom\s*|\s+apram\s*|\s+pinbu\s*|\s+aduthu\s*|\s*;\s*|\s*,\s*|\s*\.\s*|\s+and\s+)\s*/i)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  // Deduplicate and filter out filler words
  const actions = [];
  for (const seg of rawSegments) {
    const cleanSeg = seg.replace(/^(then|next|afterwards|finally|aprom|apram|pinbu|aduthu|and)\s+/i, '').trim();
    if (cleanSeg && !actions.includes(cleanSeg)) {
      actions.push(cleanSeg);
    }
  }

  return actions.length > 0 ? actions : [text];
}

/**
 * Detect explicit camera movement requested by user
 */
function detectExplicitCamera(promptText) {
  const lower = promptText.toLowerCase();
  for (const kw of CAMERA_KEYWORDS) {
    if (lower.includes(kw)) {
      return kw;
    }
  }
  return null;
}

/**
 * Main prompt interpreter function
 */
export function interpretVideoPrompt(userPrompt, options = {}) {
  const raw = (userPrompt || '').trim();
  if (!raw) {
    return {
      rawPrompt: '',
      interpretedPrompt: '',
      actionSequence: [],
      cameraInstruction: 'Stable fixed perspective (no forced zoom)',
      hasExplicitCamera: false,
      negativePrompt: 'unwanted camera zoom, forced zoom in, forced zoom out, erratic camera motion replacing subject action, low quality, distorted anatomy'
    };
  }

  // 1. Identify all sequential actions in order
  const actionSequence = extractActionSequence(raw);

  // 2. Check for explicit camera instruction
  const explicitCamera = detectExplicitCamera(raw);
  const hasExplicitCamera = Boolean(explicitCamera);

  // 3. Build Camera Direction Note
  // IMPORTANT: If user did NOT specify camera movement, default to a STABLE camera that clearly shows the action
  const cameraDirective = hasExplicitCamera
    ? `Follow camera movement: ${explicitCamera}.`
    : 'Stable, steady locked-off camera framing the subject and action clearly without automatic zoom.';

  // 4. Construct high-fidelity sequential prompt for AI video generation model
  // LTX-Video / Diffusion models respond best to clear chronological descriptions
  let chronologicalNarrative = '';
  if (actionSequence.length > 1) {
    chronologicalNarrative = actionSequence
      .map((action, idx) => {
        if (idx === 0) return action;
        if (idx === actionSequence.length - 1) return `then finally ${action}`;
        return `then ${action}`;
      })
      .join(', ');
  } else {
    chronologicalNarrative = raw;
  }

  // Combine with character/subject consistency and physical fidelity
  const interpretedPrompt = `${chronologicalNarrative}. ${cameraDirective} Natural physical movement, realistic physics, smooth temporal continuity, consistent character and objects, high quality cinematic 4K render.`;

  // 5. Build strict Negative Prompt
  // Prevents the model from replacing actions with lazy camera zooms or skipping steps
  const negativePrompt = hasExplicitCamera && explicitCamera.includes('zoom')
    ? 'low quality, distorted anatomy, erratic camera, glitchy transitions, skipped actions, static freeze'
    : 'unwanted camera zoom, forced zoom in, forced zoom out, dolly zoom, camera zooming instead of subject moving, erratic camera movement, static subject with only camera moving, distorted physics, skipped actions, low quality, blurry';

  return {
    rawPrompt: raw,
    interpretedPrompt,
    actionSequence,
    cameraInstruction: hasExplicitCamera ? explicitCamera : 'Stable camera (no forced zoom)',
    hasExplicitCamera,
    negativePrompt
  };
}
