export function parseFriendlyError(rawError: string): string {
  if (rawError.includes('SyntaxError')) {
    if (rawError.includes('expected') || rawError.includes('invalid syntax')) {
      if (rawError.includes('for') || rawError.includes('while') || rawError.includes('if') || rawError.includes('def')) {
        return '哎呀！这行代码后面少了一个冒号(:)，就像开门一样，没有冒号代码就进不去哦！🔍';
      }
      return '哎呀！这里有个小错误，检查一下引号、括号是不是配对？🧩';
    }
    if (rawError.includes('unexpected indent')) {
      return 'Python很在意对齐！这一行不需要缩进哦，把前面的空格去掉试试 📏';
    }
    if (rawError.includes('EOF') || rawError.includes('EOL')) {
      return '代码还没写完呢！是不是少了括号或者引号？检查一下结尾 🧩';
    }
    return '哎呀！代码里有个小错误，仔细看看红色标记的地方 🔧';
  }

  if (rawError.includes('IndentationError')) {
    return 'Python很讲究对齐！就像排队一样，在for或if里面的代码需要多缩进4个空格 📏';
  }

  const nameMatch = rawError.match(/name '(.+?)' is not defined/);
  if (nameMatch) {
    return `Python说不认识"${nameMatch[1]}"这个变量哦！你是不是忘记先用 ${nameMatch[1]} = xxx 来介绍它了？🤔`;
  }

  if (rawError.includes('TypeError')) {
    return '类型不太匹配！就像不能把苹果和数字相加一样，检查一下数据类型 🍎';
  }

  if (rawError.includes('NameError')) {
    return 'Python找不到这个名字！检查一下拼写是不是写对了 ✏️';
  }

  if (rawError.includes('ImportError') || rawError.includes('ModuleNotFoundError')) {
    return '这个模块Python不认识哦，检查一下名字有没有写对 📚';
  }

  return '代码遇到了一点小问题，不要急，再仔细看看！💪';
}
