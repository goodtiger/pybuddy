import * as Blockly from 'blockly';

const TURTLE_BLOCKS: Record<string, any> = {
  print_text: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('说一句话')
        .appendField(new Blockly.FieldTextInput('你好，世界！'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('让Python把一句话显示出来');
    },
  },
  print_number: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('显示数字')
        .appendField(new Blockly.FieldNumber(5, -999, 999, 1), 'NUMBER');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('显示一个数字或者计算结果');
    },
  },
  variable_set_name: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('把名字放进盒子')
        .appendField(new Blockly.FieldTextInput('小明'), 'VALUE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('变量就像一个有名字的小盒子');
    },
  },
  variable_print_name: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('介绍我的名字');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('把名字盒子里的内容说出来');
    },
  },
  math_add_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('计算')
        .appendField(new Blockly.FieldNumber(2, -99, 99, 1), 'A')
        .appendField('+')
        .appendField(new Blockly.FieldNumber(3, -99, 99, 1), 'B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(35);
      this.setTooltip('让Python帮你做加法');
    },
  },
  math_subtract_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('计算')
        .appendField(new Blockly.FieldNumber(10, -99, 99, 1), 'A')
        .appendField('-')
        .appendField(new Blockly.FieldNumber(4, -99, 99, 1), 'B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(35);
      this.setTooltip('让Python帮你做减法');
    },
  },
  math_multiply_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('计算')
        .appendField(new Blockly.FieldNumber(3, -99, 99, 1), 'A')
        .appendField('×')
        .appendField(new Blockly.FieldNumber(5, -99, 99, 1), 'B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(35);
      this.setTooltip('让Python帮你做乘法');
    },
  },
  compare_score_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('分数')
        .appendField(new Blockly.FieldNumber(8, 0, 100, 1), 'SCORE')
        .appendField('至少')
        .appendField(new Blockly.FieldNumber(6, 0, 100, 1), 'TARGET')
        .appendField('就说通过');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('用比较和 if 判断分数是否达到目标');
    },
  },
  if_else_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('如果')
        .appendField(new Blockly.FieldTextInput('天气'), 'NAME')
        .appendField('是')
        .appendField(new Blockly.FieldTextInput('晴天'), 'VALUE');
      this.appendDummyInput()
        .appendField('就说')
        .appendField(new Blockly.FieldTextInput('去画太阳'), 'YES');
      this.appendDummyInput()
        .appendField('否则说')
        .appendField(new Blockly.FieldTextInput('画彩虹'), 'NO');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('让 Python 根据条件选择不同输出');
    },
  },
  random_color_turtle: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('随机选颜色画一条线');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(300);
      this.setTooltip('从颜色列表随机挑一个颜色，再让小海龟画线');
    },
  },
  color_list_print: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('打印颜色清单');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(300);
      this.setTooltip('列表可以保存多个颜色');
    },
  },
  list_loop_turtle: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('用颜色列表画彩色折线');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(300);
      this.setTooltip('for 循环可以逐个使用列表里的颜色');
    },
  },
  define_square_function: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('定义画正方形函数，边长')
        .appendField(new Blockly.FieldNumber(80, 20, 220, 10), 'SIZE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('函数可以把一组动作打包成新魔法');
    },
  },
  call_square_function: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('调用画正方形函数');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('调用函数，执行打包好的动作');
    },
  },
  function_pattern_project: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('函数画三朵方形花');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('综合使用函数、循环、颜色和移动');
    },
  },
  repeat_square: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('重复画')
        .appendField(new Blockly.FieldNumber(4, 1, 12, 1), 'TIMES')
        .appendField('次');
      this.appendStatementInput('DO').appendField('每次做');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('重复里面的积木，适合画正方形、花朵和螺旋');
    },
  },
  turtle_import: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('🐢 导入海龟模块');
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('导入turtle模块，准备让小海龟动起来！');
    },
  },
  turtle_forward: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('小海龟前进')
        .appendField(new Blockly.FieldNumber(100, 0, 500, 1), 'DISTANCE')
        .appendField('步');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('让小海龟向前走指定的步数');
    },
  },
  turtle_forward_grow: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('每圈多走')
        .appendField(new Blockly.FieldNumber(20, 0, 300, 1), 'START')
        .appendField('+ 第几圈 ×')
        .appendField(new Blockly.FieldNumber(8, 1, 50, 1), 'STEP')
        .appendField('步');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('在循环里使用，让小海龟每次走得更远');
    },
  },
  turtle_backward: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('小海龟后退')
        .appendField(new Blockly.FieldNumber(50, 0, 500, 1), 'DISTANCE')
        .appendField('步');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_right: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('右转')
        .appendField(new Blockly.FieldNumber(90, 0, 360, 15), 'ANGLE')
        .appendField('度');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_left: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('左转')
        .appendField(new Blockly.FieldNumber(90, 0, 360, 15), 'ANGLE')
        .appendField('度');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_color: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('画笔颜色')
        .appendField(new Blockly.FieldDropdown([
          ['红色', 'red'], ['绿色', 'green'], ['蓝色', 'blue'],
          ['黄色', 'yellow'], ['紫色', 'purple'], ['橙色', 'orange'],
          ['粉色', 'pink'], ['黑色', 'black'],
        ]), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_pen_up: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('抬起画笔');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_pen_down: {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField('放下画笔');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
  turtle_circle: {
    init(this: Blockly.Block) {
      this.appendDummyInput()
        .appendField('画圆，半径')
        .appendField(new Blockly.FieldNumber(50, 0, 200, 5), 'RADIUS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    },
  },
};

export function defineTurtleBlocks() {
  Object.entries(TURTLE_BLOCKS).forEach(([name, definition]) => {
    Blockly.Blocks[name] = definition;
  });
}

export { TURTLE_BLOCKS };
