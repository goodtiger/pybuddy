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
