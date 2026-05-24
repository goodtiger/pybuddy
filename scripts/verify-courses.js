const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const coursesDir = path.join(root, 'public', 'courses');

const definedBlocks = new Set([
  'print_text',
  'print_number',
  'variable_set_name',
  'variable_print_name',
  'math_add_print',
  'math_subtract_print',
  'math_multiply_print',
  'compare_score_print',
  'if_else_print',
  'random_color_turtle',
  'color_list_print',
  'list_loop_turtle',
  'define_square_function',
  'call_square_function',
  'function_pattern_project',
  'repeat_square',
  'turtle_import',
  'turtle_forward',
  'turtle_forward_grow',
  'turtle_backward',
  'turtle_right',
  'turtle_left',
  'turtle_color',
  'turtle_pen_up',
  'turtle_pen_down',
  'turtle_circle',
  'while_condition',
  'string_input',
  'string_upper',
  'string_lower',
  'dict_create',
  'dict_get',
  'dict_set',
  'fstring_print',
]);

const blockAliases = {
  print: ['print_text', 'print_number'],
  variable: ['variable_set_name', 'variable_print_name'],
  math: ['math_add_print', 'math_subtract_print', 'math_multiply_print'],
  condition: ['compare_score_print', 'if_else_print'],
  random: ['random_color_turtle'],
  list: ['color_list_print', 'list_loop_turtle'],
  function: ['define_square_function', 'call_square_function', 'function_pattern_project'],
  while: ['while_condition'],
  input: ['string_input'],
  string: ['string_input', 'string_upper', 'string_lower'],
  dict: ['dict_create', 'dict_get', 'dict_set'],
  fstring: ['fstring_print'],
};

const codeRequirements = [
  { pattern: /print\(/, blocks: ['print_text', 'print_number', 'math_add_print', 'math_subtract_print', 'math_multiply_print', 'compare_score_print', 'if_else_print', 'color_list_print'] },
  { pattern: /name\s*=/, blocks: ['variable_set_name', 'string_input'] },
  { pattern: /input\(/, blocks: ['string_input'] },
  { pattern: /\.upper\(\)/, blocks: ['string_upper'] },
  { pattern: /\.lower\(\)/, blocks: ['string_lower'] },
  { pattern: /pet\s*=/, blocks: ['dict_create'] },
  { pattern: /pet\['/, blocks: ['dict_get', 'dict_set'] },
  { pattern: /f['"]/i, blocks: ['fstring_print'] },
  { pattern: /while\b/, blocks: ['while_condition'] },
  { pattern: /\+ name/, blocks: ['variable_print_name'] },
  { pattern: /print\([^)\n]*\d+\s*\+\s*\d+/, blocks: ['math_add_print'] },
  { pattern: /print\([^)\n]*\d+\s*-\s*\d+/, blocks: ['math_subtract_print'] },
  { pattern: /print\([^)\n]*\d+\s*\*\s*\d+/, blocks: ['math_multiply_print'] },
  { pattern: /import turtle/, blocks: ['turtle_import', 'random_color_turtle', 'list_loop_turtle', 'function_pattern_project'] },
  { pattern: /import random/, blocks: ['random_color_turtle'] },
  { pattern: /random\.choice/, blocks: ['random_color_turtle'] },
  { pattern: /\bif\b/, blocks: ['compare_score_print', 'if_else_print'] },
  { pattern: />=/, blocks: ['compare_score_print'] },
  { pattern: /==/, blocks: ['if_else_print'] },
  { pattern: /\belse:/, blocks: ['compare_score_print', 'if_else_print'] },
  { pattern: /\bcolors\s*=/, blocks: ['random_color_turtle', 'color_list_print', 'list_loop_turtle', 'function_pattern_project'] },
  { pattern: /colors\[0\]/, blocks: ['color_list_print'] },
  { pattern: /len\(colors\)/, blocks: ['color_list_print'] },
  { pattern: /for .*range/, blocks: ['repeat_square', 'define_square_function', 'function_pattern_project'] },
  { pattern: /for .* in colors/, blocks: ['list_loop_turtle', 'function_pattern_project'] },
  { pattern: /def draw_square/, blocks: ['define_square_function', 'function_pattern_project'] },
  { pattern: /draw_square\(/, blocks: ['call_square_function', 'function_pattern_project'] },
  { pattern: /\.forward\(20 \+ i \* 8\)/, blocks: ['turtle_forward_grow'] },
  { pattern: /\.forward\(/, blocks: ['turtle_forward', 'turtle_forward_grow', 'random_color_turtle', 'list_loop_turtle', 'define_square_function', 'function_pattern_project'] },
  { pattern: /\.backward\(/, blocks: ['turtle_backward'] },
  { pattern: /\.right\(/, blocks: ['turtle_right', 'list_loop_turtle', 'define_square_function', 'function_pattern_project'] },
  { pattern: /\.left\(/, blocks: ['turtle_left'] },
  { pattern: /\.color\(/, blocks: ['turtle_color', 'random_color_turtle', 'list_loop_turtle', 'function_pattern_project'] },
  { pattern: /\.circle\(/, blocks: ['turtle_circle'] },
  { pattern: /\.penup\(/, blocks: ['turtle_pen_up', 'function_pattern_project'] },
  { pattern: /\.pendown\(/, blocks: ['turtle_pen_down', 'function_pattern_project'] },
];

function expandBlocks(blocks) {
  return new Set(blocks.flatMap((block) => blockAliases[block] || [block]));
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function countMatches(code, pattern) {
  return code.match(pattern)?.length || 0;
}

function summarizeTurtleCode(code) {
  return {
    imported: /\bimport\s+turtle\b/.test(code),
    created: /\bturtle\.Turtle\s*\(/.test(code),
    movementCount: countMatches(code, /\.(?:forward|backward)\s*\(/g),
    turnCount: countMatches(code, /\.(?:right|left)\s*\(/g),
    circleCount: countMatches(code, /\.circle\s*\(/g),
    colorCount: countMatches(code, /\.color\s*\(/g),
    penCount: countMatches(code, /\.(?:penup|pendown)\s*\(/g),
    repeatCount: countMatches(code, /\bfor\s+\w+\s+in\s+(?:range\s*\(|\w+)/g),
  };
}

function verifyTurtleActions(file, lesson) {
  const required = lesson.validation.turtle_actions;
  if (!required) {
    if (lesson.visual.type === 'turtle_canvas') {
      fail(`${file}: turtle_canvas lessons must declare validation.turtle_actions.`);
    }
    return;
  }

  const summary = summarizeTurtleCode(lesson.expected_code);
  const checks = [
    ['imported', required.imported, summary.imported],
    ['created', required.created, summary.created],
    ['min_movement', required.min_movement, summary.movementCount],
    ['min_turns', required.min_turns, summary.turnCount],
    ['min_circles', required.min_circles, summary.circleCount],
    ['min_colors', required.min_colors, summary.colorCount],
    ['min_pen_changes', required.min_pen_changes, summary.penCount],
    ['min_repeats', required.min_repeats, summary.repeatCount],
  ];

  for (const [name, requiredValue, actual] of checks) {
    if (typeof requiredValue === 'boolean' && requiredValue !== actual) {
      fail(`${file}: expected_code does not satisfy turtle_actions.${name}.`);
    }
    if (typeof requiredValue === 'number' && actual < requiredValue) {
      fail(`${file}: expected_code has ${actual} for ${name}, expected at least ${requiredValue}.`);
    }
  }
}

const levelDirs = fs
  .readdirSync(coursesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^level-\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

let lessonCount = 0;

if (levelDirs.length === 0) {
  fail('No lesson JSON files found.');
}

levelDirs.forEach((levelDirName) => {
  const lessonsDir = path.join(coursesDir, levelDirName);
  const levelNumber = Number(levelDirName.replace('level-', ''));
  const files = fs.readdirSync(lessonsDir).filter((file) => /^lesson_\d+\.json$/.test(file)).sort();
  if (files.length === 0) fail(`${levelDirName}: no lesson JSON files found.`);

  files.forEach((file, index) => {
  const label = `${levelDirName}/${file}`;
  const lesson = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
  const expectedId = `lesson_${String(index + 1).padStart(3, '0')}`;
  const expanded = expandBlocks(lesson.blocks.available);

  lessonCount += 1;

  if (lesson.level !== levelNumber) {
    fail(`${label}: expected level ${levelNumber}, got ${lesson.level}`);
  }

  if (lesson.id !== expectedId) {
    fail(`${label}: expected id ${expectedId}, got ${lesson.id}`);
  }

  if (lesson.number !== index + 1) {
    fail(`${label}: expected number ${index + 1}, got ${lesson.number}`);
  }

  for (const block of expanded) {
    if (!definedBlocks.has(block)) {
      fail(`${label}: block "${block}" is not defined in Blockly.`);
    }
  }

  for (const rule of codeRequirements) {
    if (!rule.pattern.test(lesson.expected_code)) continue;
    const hasSupportingBlock = rule.blocks.some((block) => expanded.has(block));
    if (!hasSupportingBlock) {
      fail(`${label}: expected_code uses ${rule.pattern}, but available blocks do not support it.`);
    }
  }

  for (const token of lesson.validation.must_contain || []) {
    if (!lesson.expected_code.replace(/\s+/g, '').includes(String(token).replace(/\s+/g, ''))) {
      fail(`${label}: validation token "${token}" is not present in expected_code.`);
    }
  }

  if (lesson.validation.visual_check === 'text_output' && lesson.visual.type !== 'text_output') {
    fail(`${label}: text_output validation must use visual.type "text_output".`);
  }

  if (lesson.validation.visual_check === 'turtle_canvas' && lesson.visual.type !== 'turtle_canvas') {
    fail(`${label}: turtle_canvas validation must use visual.type "turtle_canvas".`);
  }

  verifyTurtleActions(label, lesson);
  });
});

if (!process.exitCode) {
  console.log(`Verified ${lessonCount} lessons across ${levelDirs.length} levels against ${definedBlocks.size} Blockly blocks.`);
}
