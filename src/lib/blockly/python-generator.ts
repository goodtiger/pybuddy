import { pythonGenerator } from 'blockly/python';

export function setupPythonGenerator() {
  pythonGenerator.forBlock['print_text'] = (block) => {
    const text = String(block.getFieldValue('TEXT') || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `print('${text}')\n`;
  };
  pythonGenerator.forBlock['print_number'] = (block) => {
    const number = block.getFieldValue('NUMBER');
    return `print(${number})\n`;
  };
  pythonGenerator.forBlock['variable_set_name'] = (block) => {
    const value = String(block.getFieldValue('VALUE') || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `name = '${value}'\n`;
  };
  pythonGenerator.forBlock['variable_print_name'] = () => "print('我的名字是' + name)\n";
  pythonGenerator.forBlock['math_add_print'] = (block) => {
    const a = block.getFieldValue('A');
    const b = block.getFieldValue('B');
    return `print(${a} + ${b})\n`;
  };
  pythonGenerator.forBlock['math_subtract_print'] = (block) => {
    const a = block.getFieldValue('A');
    const b = block.getFieldValue('B');
    return `print(${a} - ${b})\n`;
  };
  pythonGenerator.forBlock['math_multiply_print'] = (block) => {
    const a = block.getFieldValue('A');
    const b = block.getFieldValue('B');
    return `print(${a} * ${b})\n`;
  };
  pythonGenerator.forBlock['compare_score_print'] = (block) => {
    const score = block.getFieldValue('SCORE');
    const target = block.getFieldValue('TARGET');
    return `score = ${score}\nif score >= ${target}:\n  print('通过')\nelse:\n  print('继续练习')\n`;
  };
  pythonGenerator.forBlock['if_else_print'] = (block) => {
    const name = String(block.getFieldValue('NAME') || '天气').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const value = String(block.getFieldValue('VALUE') || '晴天').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const yes = String(block.getFieldValue('YES') || '去画太阳').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const no = String(block.getFieldValue('NO') || '画彩虹').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${name} = '${value}'\nif ${name} == '${value}':\n  print('${yes}')\nelse:\n  print('${no}')\n`;
  };
  pythonGenerator.forBlock['random_color_turtle'] = () =>
    "import turtle\nimport random\nt = turtle.Turtle()\ncolors = ['red', 'blue', 'green', 'purple']\nchoice = random.choice(colors)\nt.color(choice)\nt.forward(120)\n";
  pythonGenerator.forBlock['color_list_print'] = () =>
    "colors = ['red', 'blue', 'green']\nprint(colors[0])\nprint(len(colors))\n";
  pythonGenerator.forBlock['list_loop_turtle'] = () =>
    "import turtle\nt = turtle.Turtle()\ncolors = ['red', 'blue', 'green', 'purple']\nfor color in colors:\n  t.color(color)\n  t.forward(70)\n  t.right(90)\n";
  pythonGenerator.forBlock['define_square_function'] = (block) => {
    const size = block.getFieldValue('SIZE');
    return `def draw_square(size):\n  for i in range(4):\n    t.forward(size)\n    t.right(90)\nsize = ${size}\n`;
  };
  pythonGenerator.forBlock['call_square_function'] = () => 'draw_square(size)\n';
  pythonGenerator.forBlock['function_pattern_project'] = () =>
    "import turtle\nt = turtle.Turtle()\ndef draw_square(size):\n  for i in range(4):\n    t.forward(size)\n    t.right(90)\ncolors = ['red', 'blue', 'green']\nfor color in colors:\n  t.color(color)\n  draw_square(70)\n  t.penup()\n  t.forward(100)\n  t.pendown()\n";
  pythonGenerator.forBlock['repeat_square'] = (block, generator) => {
    const times = block.getFieldValue('TIMES');
    const branch = generator.statementToCode(block, 'DO') || '  pass\n';
    return `for i in range(${times}):\n${branch}`;
  };
  pythonGenerator.forBlock['turtle_import'] = () => 'import turtle\nt = turtle.Turtle()\n';
  pythonGenerator.forBlock['turtle_forward'] = (block) => {
    const dist = block.getFieldValue('DISTANCE');
    return `t.forward(${dist})\n`;
  };
  pythonGenerator.forBlock['turtle_forward_grow'] = (block) => {
    const start = block.getFieldValue('START');
    const step = block.getFieldValue('STEP');
    return `t.forward(${start} + i * ${step})\n`;
  };
  pythonGenerator.forBlock['turtle_backward'] = (block) => {
    const dist = block.getFieldValue('DISTANCE');
    return `t.backward(${dist})\n`;
  };
  pythonGenerator.forBlock['turtle_right'] = (block) => {
    const angle = block.getFieldValue('ANGLE');
    return `t.right(${angle})\n`;
  };
  pythonGenerator.forBlock['turtle_left'] = (block) => {
    const angle = block.getFieldValue('ANGLE');
    return `t.left(${angle})\n`;
  };
  pythonGenerator.forBlock['turtle_color'] = (block) => {
    const color = block.getFieldValue('COLOR');
    return `t.color('${color}')\n`;
  };
  pythonGenerator.forBlock['turtle_pen_up'] = () => 't.penup()\n';
  pythonGenerator.forBlock['turtle_pen_down'] = () => 't.pendown()\n';
  pythonGenerator.forBlock['turtle_circle'] = (block) => {
    const radius = block.getFieldValue('RADIUS');
    return `t.circle(${radius})\n`;
  };
}

export { pythonGenerator };
