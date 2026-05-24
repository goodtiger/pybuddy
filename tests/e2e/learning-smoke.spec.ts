import { expect, test } from '@playwright/test';

async function dragFirstFlyoutBlockToWorkspace(page: import('@playwright/test').Page) {
  await dragFlyoutBlockToWorkspace(page, 0);
}

async function dragFlyoutBlockToWorkspace(page: import('@playwright/test').Page, index: number, yOffset = 60) {
  await scrollBlocklyIntoView(page);

  const flyoutBlock = page.locator('.blocklyFlyout .blocklyDraggable').nth(index);
  await expect(flyoutBlock).toBeVisible();
  const blockBox = await flyoutBlock.boundingBox();
  const targetBox = await getWorkspaceTargetBox(page);
  expect(blockBox).not.toBeNull();

  await page.mouse.move(blockBox!.x + 24, blockBox!.y + 24);
  await page.mouse.down();
  await page.mouse.move(targetBox.x, clamp(blockBox!.y + yOffset, targetBox.top, targetBox.bottom), { steps: 12 });
  await page.mouse.up();
}

async function dragFlyoutBlockByText(page: import('@playwright/test').Page, text: string, yOffset = 60) {
  await scrollBlocklyIntoView(page);

  const flyoutBlock = page
    .locator('.blocklyFlyout:not(.blocklyTrashcanFlyout) .blocklyDraggable')
    .filter({ hasText: text })
    .first();
  await expect(flyoutBlock).toBeVisible();
  const blockBox = await flyoutBlock.boundingBox();
  const targetBox = await getWorkspaceTargetBox(page);
  expect(blockBox).not.toBeNull();

  await page.mouse.move(blockBox!.x + 24, blockBox!.y + 24);
  await page.mouse.down();
  await page.mouse.move(targetBox.x, clamp(blockBox!.y + yOffset, targetBox.top, targetBox.bottom), { steps: 12 });
  await page.mouse.up();
}

async function scrollBlocklyIntoView(page: import('@playwright/test').Page) {
  await page.locator('.blocklySvg').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
}

async function getWorkspaceTargetBox(page: import('@playwright/test').Page) {
  const blocklySvg = page.locator('.blocklySvg').first();
  const flyout = page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)').first();
  await expect(blocklySvg).toBeVisible();
  await expect(flyout).toBeVisible();

  const [svgBox, flyoutBox] = await Promise.all([blocklySvg.boundingBox(), flyout.boundingBox()]);
  expect(svgBox).not.toBeNull();
  expect(flyoutBox).not.toBeNull();

  const workspaceLeft = flyoutBox!.x + flyoutBox!.width + 48;
  const workspaceRight = svgBox!.x + svgBox!.width - 96;
  const x = workspaceLeft < workspaceRight ? (workspaceLeft + workspaceRight) / 2 : svgBox!.x + svgBox!.width * 0.75;

  return {
    x,
    top: svgBox!.y + 72,
    bottom: svgBox!.y + svgBox!.height - 72,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

test.describe('PyBuddy learning smoke', () => {
  test('course API exposes level 1 lessons and text output lesson metadata', async ({ request }) => {
    const courseResponse = await request.get('/api/v1/courses/1');
    expect(courseResponse.ok()).toBe(true);

    const coursePayload = await courseResponse.json();
    expect(coursePayload.data.lesson_count).toBe(15);
    expect(coursePayload.data.lessons[0].id).toBe('lesson_001');
    expect(coursePayload.data.lessons[14].id).toBe('lesson_015');

    const lessonResponse = await request.get('/api/v1/courses/1/lessons/lesson_001');
    expect(lessonResponse.ok()).toBe(true);

    const lessonPayload = await lessonResponse.json();
    expect(lessonPayload.data.visual.type).toBe('text_output');
    expect(lessonPayload.data.validation.visual_check).toBe('text_output');
  });

  test('course API exposes level 2 lessons and condition lesson metadata', async ({ request }) => {
    const courseResponse = await request.get('/api/v1/courses/2');
    expect(courseResponse.ok()).toBe(true);

    const coursePayload = await courseResponse.json();
    expect(coursePayload.data.title).toBe('判断小游戏岛');
    expect(coursePayload.data.lesson_count).toBe(12);
    expect(coursePayload.data.lessons[0].id).toBe('lesson_001');
    expect(coursePayload.data.lessons[11].id).toBe('lesson_012');

    const lessonResponse = await request.get('/api/v1/courses/2/lessons/lesson_001');
    expect(lessonResponse.ok()).toBe(true);

    const lessonPayload = await lessonResponse.json();
    expect(lessonPayload.data.title).toBe('分数够不够？');
    expect(lessonPayload.data.blocks.available).toContain('condition');
    expect(lessonPayload.data.validation.output_contains).toContain('通过');
  });

  test('map renders real course progress and first lesson entry point', async ({ page }) => {
    await page.goto('/map');

    await expect(page.getByRole('button', { name: 'Level 1' })).toBeVisible();
    await expect(page.getByText('0/15 课程')).toBeVisible();
    await expect(page.getByRole('button', { name: '继续学习' })).toBeVisible();
  });

  test('level 2 map renders its course and opens the first level 2 lesson', async ({ page }) => {
    await page.goto('/map?level=2');

    await expect(page.getByRole('button', { name: 'Level 2', exact: true })).toBeVisible();
    await expect(page.getByText(/判断小游戏岛/)).toBeVisible();
    await expect(page.getByText('0/12 课程')).toBeVisible();

    await page.getByRole('button', { name: '继续学习' }).click();
    await expect(page).toHaveURL(/\/learn\/level-2\/lesson_001$/);
    await expect(page.getByRole('heading', { name: '分数够不够？' })).toBeVisible();
  });

  test('families can register and switch separate learner profiles', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('孩子昵称').fill('小明');
    await page.getByLabel('家长邮箱').fill('parent@example.com');
    await page.getByRole('button', { name: '创建并开始' }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(page.getByText('小明 · 积木启蒙岛')).toBeVisible();

    await page.goto('/learn/lesson_001');
    await dragFirstFlyoutBlockToWorkspace(page);
    await page.getByRole('button', { name: '运行 Python 代码' }).click();
    await expect(page.getByText('任务完成！你可以继续下一课，或者保存这个作品。')).toBeVisible();

    await page.goto('/register');
    await expect(page.getByText('小明')).toBeVisible();
    await expect(page.getByLabel('孩子昵称')).toHaveValue('');
    await expect(page.getByLabel('家长邮箱')).toHaveValue('parent@example.com');
    await page.getByLabel('孩子昵称').fill('小红');
    await page.getByLabel('家长邮箱').fill('parent@example.com');
    await page.getByRole('button', { name: '创建并开始' }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(page.getByText('小红 · 积木启蒙岛')).toBeVisible();
    await expect(page.getByText('0/15 课程')).toBeVisible();

    await page.goto('/register');
    await page.getByRole('button', { name: /小明/ }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(page.getByText('小明 · 积木启蒙岛')).toBeVisible();
    await expect(page.getByText('1/15 课程')).toBeVisible();
  });

  test('lesson 1 renders as a text output lesson with tutor and run controls', async ({ page }) => {
    await page.goto('/learn/lesson_001');

    await expect(page.getByRole('heading', { name: '你好，世界！' })).toBeVisible();
    await expect(page.getByText('输出舞台', { exact: true })).toBeVisible();
    await expect(page.getByText('Python 输出')).toBeVisible();
    await expect(page.getByText('AI 小老师')).toBeVisible();
    await expect(page.getByRole('button', { name: '运行 Python 代码' })).toBeVisible();
    await expect(page.getByText('魔法画布')).toHaveCount(0);
  });

  test('concept card embeds a curated concept video without auto-playing', async ({ page }) => {
    await page.goto('/learn/lesson_001');

    await page.getByRole('button', { name: '播放动画' }).click();

    const videoFrame = page.locator('iframe[title="print 像小喇叭 视频"]');
    await expect(videoFrame).toBeVisible();
    await expect(videoFrame).toHaveAttribute('src', /player\.bilibili\.com/);
    await expect(videoFrame).toHaveAttribute('src', /autoplay=0/);
  });

  test('mobile keeps the block workspace before the concept animation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learn/lesson_001');

    const dragTitle = page.getByText('拖拽积木区', { exact: true });
    const conceptTitle = page.getByText('卡通概念', { exact: true }).filter({ visible: true });

    await expect(dragTitle).toBeVisible();
    await expect(conceptTitle).toBeVisible();

    const dragBox = await dragTitle.boundingBox();
    const conceptBox = await conceptTitle.boundingBox();
    expect(dragBox).not.toBeNull();
    expect(conceptBox).not.toBeNull();
    expect(dragBox!.y).toBeLessThan(520);
    expect(dragBox!.y).toBeLessThan(conceptBox!.y);

    await page.getByRole('button', { name: '播放动画' }).click();
    await expect(page.locator('iframe[title="print 像小喇叭 视频"]')).toBeVisible();
  });

  test('reset clears generated code and rebuilds the block workspace', async ({ page }) => {
    await page.goto('/learn/lesson_001');

    await dragFirstFlyoutBlockToWorkspace(page);
    await expect(page.getByText("print('你好，世界！')")).toBeVisible();

    await page.getByRole('button', { name: '重来' }).click();

    await expect(page.getByLabel('Python 代码输入区')).toHaveValue('');
  });

  test('student can complete lesson 1, save a project, and advance map progress', async ({ page }) => {
    await page.goto('/learn/lesson_001');

    await dragFirstFlyoutBlockToWorkspace(page);
    await expect(page.getByText("print('你好，世界！')")).toBeVisible();

    const runButton = page.getByRole('button', { name: '运行 Python 代码' });
    await expect(runButton).toBeEnabled();
    await runButton.click();

    await expect(page.getByText('任务完成！你可以继续下一课，或者保存这个作品。')).toBeVisible();
    await expect(page.getByText('输出已经保留在这里，可以先检查结果。')).toBeVisible();
    await expect(page.getByRole('heading', { name: '太棒了！' })).toHaveCount(0);
    await page.getByRole('button', { name: '完成这课' }).click();
    await expect(page.getByRole('heading', { name: '太棒了！' })).toBeVisible();
    await expect(page.getByText('作品已保存到个人作品夹，家长批准后可以分享。')).toBeVisible();

    const storedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('pybuddy-progress') || '{}'));
    expect(storedProgress.state.completedLessons).toContain('level_1:lesson_001');
    expect(storedProgress.state.currentLesson).toBe(2);
    expect(storedProgress.state.totalStars).toBe(3);

    const storedProjects = await page.evaluate(() => JSON.parse(localStorage.getItem('pybuddy-projects') || '{}'));
    expect(storedProjects.state.projects[0].level).toBe(1);
    expect(storedProjects.state.projects[0].lessonId).toBe('lesson_001');
    expect(storedProjects.state.projects[0].code).toContain("print('你好，世界！')");

    await page.getByRole('button', { name: '回地图' }).click();
    await expect(page.getByText('1/15 课程')).toBeVisible();
  });

  test('parent dashboard reflects real progress instead of demo numbers', async ({ page }) => {
    await page.goto('/parent');

    await expect(page.getByText('0/27')).toHaveCount(2);
    await expect(page.getByText('0 分钟', { exact: true })).toBeVisible();
    await expect(page.getByText('完成第一课后，这里会自动记录孩子学会的内容。')).toBeVisible();
    await expect(page.getByText('86%')).toHaveCount(0);

    await page.evaluate(() => {
      localStorage.setItem(
        'pybuddy-progress',
        JSON.stringify({
          state: {
            completedLessons: ['lesson_001'],
            lessonStars: { lesson_001: 3 },
            currentLevel: 1,
            currentLesson: 2,
            streakDays: 1,
            totalStars: 3,
          },
          version: 1,
        })
      );
    });
    await page.reload();

    await expect(page.getByText('1/27')).toHaveCount(2);
    await expect(page.getByText('6 分钟', { exact: true })).toBeVisible();
    await expect(page.getByText('用 print 输出文字')).toBeVisible();
    await expect(page.getByText('20%')).toBeVisible();
  });

  test('student can complete level 2 lesson 1 and stores level-aware progress', async ({ page }) => {
    await page.goto('/learn/level-2/lesson_001');

    await expect(page.getByRole('heading', { name: '分数够不够？' })).toBeVisible();
    await expect(page.locator('.blocklyFlyout text').filter({ hasText: '分数' }).first()).toBeVisible();

    await page.getByRole('button', { name: '填入示例' }).click();
    await expect(page.getByLabel('Python 代码输入区')).toContainText('score = 8');

    await page.getByRole('button', { name: '运行 Python 代码' }).click();
    await expect(page.locator('pre').filter({ hasText: /^通过$/ }).first()).toBeVisible();
    await expect(page.getByText('任务完成！你可以继续下一课，或者保存这个作品。')).toBeVisible();

    const storedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('pybuddy-progress') || '{}'));
    expect(storedProgress.state.completedLessons).toContain('level_2:lesson_001');
    expect(storedProgress.state.currentLevel).toBe(2);
    expect(storedProgress.state.currentLesson).toBe(2);

    const storedProjects = await page.evaluate(() => JSON.parse(localStorage.getItem('pybuddy-projects') || '{}'));
    expect(storedProjects.state.projects[0].level).toBe(2);
    expect(storedProjects.state.projects[0].lessonId).toBe('lesson_001');
    expect(storedProjects.state.projects[0].output).toContain('通过');
  });

  test('lesson 4 renders as a turtle canvas lesson', async ({ page }) => {
    await page.goto('/learn/lesson_004');

    await expect(page.getByRole('heading', { name: '认识小海龟' })).toBeVisible();
    await expect(page.getByText('魔法画布')).toBeVisible();
    await expect(page.getByRole('button', { name: '运行 Python 代码' })).toBeVisible();
  });

  test('turtle lesson requires real movement before awarding completion', async ({ page }) => {
    await page.goto('/learn/lesson_005');

    await dragFlyoutBlockToWorkspace(page, 0);
    await expect(page.getByText('import turtle')).toBeVisible();

    await page.getByRole('button', { name: '运行 Python 代码' }).click();
    await expect(page.getByText('还差 forward。先把这个积木或代码加进去。')).toBeVisible();
    await expect(page.getByRole('heading', { name: '太棒了！' })).toHaveCount(0);

    await dragFlyoutBlockByText(page, '小海龟前进', 120);
    await expect(page.getByText('t.forward(100)')).toBeVisible();

    await page.getByRole('button', { name: '运行 Python 代码' }).click();
    await expect(page.getByText('任务完成！你可以继续下一课，或者保存这个作品。')).toBeVisible();
    await expect(page.getByRole('heading', { name: '太棒了！' })).toHaveCount(0);
    await page.getByRole('button', { name: '完成这课' }).click();
    await expect(page.getByRole('heading', { name: '太棒了！' })).toBeVisible();
  });

  test('tutor accepts text output lesson payload and returns a local-safe reply', async ({ request }) => {
    const lessonResponse = await request.get('/api/v1/courses/1/lessons/lesson_001');
    const lessonPayload = await lessonResponse.json();

    const tutorResponse = await request.post('/api/tutor', {
      data: {
        message: '我不会写 print 怎么办？',
        lesson: lessonPayload.data,
        currentCode: '',
        currentError: null,
      },
    });

    expect(tutorResponse.ok()).toBe(true);
    const tutorPayload = await tutorResponse.json();
    expect(tutorPayload.reply).toContain('print');
  });
});
