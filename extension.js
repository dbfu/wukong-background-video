// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path');
const { readFileSync, writeFileSync, copyFileSync, unlinkSync } = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let config = vscode.workspace.getConfiguration('background-video');

	const opacity = config.get('opacity');
	const videoName = config.get('videoName');

	const workbenchDirPath = path.join(path.dirname((require.main).filename), 'vs', 'code', 'electron-sandbox', 'workbench');
	const workbenchFilePath = path.join(workbenchDirPath, 'workbench.js');

	const jsPath = path.resolve(context.extensionPath, 'resources/main.js');
	const video1Path = path.resolve(context.extensionPath, 'resources/video1.mp4');
	const video2Path = path.resolve(context.extensionPath, 'resources/video2.mp4');
	function setContent(opacity = 0.4, videoName = 'video1.mp4') {
		let jsCode = readFileSync(jsPath, 'utf8').toString();

		jsCode = jsCode.replace('{opacity}', opacity ? +opacity : 0.4);
		jsCode = jsCode.replace('{videoName}', videoName);

		let workbenchCode = readFileSync(workbenchFilePath, 'utf8').toString();

		const re = new RegExp("\\/\\*background-video-start\\*\\/[\\s\\S]*?\\/\\*background-video-end\\*" + "\\/", "g");

		workbenchCode = workbenchCode.replace(re, '');
		workbenchCode = workbenchCode.replace(/\s*$/, '');


		writeFileSync(workbenchFilePath, `${workbenchCode} 
/*background-video-start*/
${jsCode} 
/*background-video-end*/`);
		copyFileSync(video1Path, path.join(workbenchDirPath, 'video1.mp4'));
		copyFileSync(video2Path, path.join(workbenchDirPath, 'video2.mp4'));
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
		unlinkSync(path.join(workbenchDirPath, 'video1.mp4'));
		unlinkSync(path.join(workbenchDirPath, 'video2.mp4'));

		vscode.window.showInformationMessage('内容删除成功, 可以卸载插件了。');
	}));



}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
