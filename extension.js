// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path');
const { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let config = vscode.workspace.getConfiguration('background-video');

	const opacity = config.get('opacity');
	const videoName = config.get('videoName');

	// 获取vscode js目录
	const workbenchDirPath = path.join(path.dirname((require.main).filename), 'vs', 'code', 'electron-sandbox', 'workbench');
	const workbenchFilePath = path.join(workbenchDirPath, 'workbench.js');

	const jsPath = path.resolve(context.extensionPath, 'resources/main.js');
	function setContent(opacity = 0.4, videoName = 'video1.mp4') {
		let jsCode = readFileSync(jsPath, 'utf8').toString();

		jsCode = jsCode.replace('{opacity}', opacity ? +opacity : 0.4);

		if (videoName === '随机') {
			const random = Math.floor(Math.random() * 6) + 1;
			jsCode = jsCode.replace('{videoName}', `video${random}.mp4`);
		} else {
			jsCode = jsCode.replace('{videoName}', videoName);
		}

		let workbenchCode = readFileSync(workbenchFilePath, 'utf8').toString();

		const re = new RegExp("\\/\\*background-video-start\\*\\/[\\s\\S]*?\\/\\*background-video-end\\*" + "\\/", "g");

		workbenchCode = workbenchCode.replace(re, '');
		workbenchCode = workbenchCode.replace(/\s*$/, '');

		writeFileSync(workbenchFilePath, `${workbenchCode} 
/*background-video-start*/
${jsCode} 
/*background-video-end*/`);

		for (let i = 1; i <= 6; i += 1) {
			if (!existsSync(path.join(workbenchDirPath, `video${i}.mp4`))) {
				copyFileSync(
					path.resolve(context.extensionPath, `resources/video${i}.mp4`), path.join(workbenchDirPath, `video${i}.mp4`)
				);
			}
		}
	}


	setContent(opacity, videoName);


	vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('background-video.opacity') || event.affectsConfiguration('background-video.videoName')) {
			config = vscode.workspace.getConfiguration('background-video');
			const opacity = config.get('opacity');
			const videoName = config.get('videoName');
			setContent(opacity, videoName);
			vscode.window.showInformationMessage('配置已更新，重启vscode后生效');
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('background-video.uninstall', () => {
		let workbenchCode = readFileSync(workbenchFilePath, 'utf8').toString();

		const re = new RegExp("\\/\\*background-video-start\\*\\/[\\s\\S]*?\\/\\*background-video-end\\*" + "\\/", "g");

		workbenchCode = workbenchCode.replace(re, '');
		workbenchCode = workbenchCode.replace(/\s*$/, '');

		writeFileSync(workbenchFilePath, workbenchCode);

		// 删除视频文件
		for (let i = 1; i <= 6; i += 1) {
			if (existsSync(path.join(workbenchDirPath, `video${i}.mp4`))) {
				unlinkSync(path.join(workbenchDirPath, `video${i}.mp4`));
			}
		}

		vscode.window.showInformationMessage('内容删除成功, 可以卸载插件了。');
	}));
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
