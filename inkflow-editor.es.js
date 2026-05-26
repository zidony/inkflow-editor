//#region src/ui/icons.ts
var e = (e) => `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" fill="currentColor" viewBox="0 0 16 16">${e}</svg>`, t = {
	bold: e("<path d=\"M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z\"/>"),
	italic: e("<path d=\"M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z\"/>"),
	underline: e("<path d=\"M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z\"/>"),
	strike: e("<path d=\"M6.333 5.686c0 .31.083.581.27.814H5.166a2.8 2.8 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967\"/>"),
	inlineCode: e("<path d=\"M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z\"/>"),
	eraser: e("<path d=\"M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414l-3.879-3.879zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z\"/>"),
	alignLeft: e("<path fill-rule=\"evenodd\" d=\"M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z\"/>"),
	alignCenter: e("<path fill-rule=\"evenodd\" d=\"M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z\"/>"),
	alignRight: e("<path fill-rule=\"evenodd\" d=\"M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z\"/>"),
	listUl: e("<path fill-rule=\"evenodd\" d=\"M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z\"/>"),
	listOl: e("<path fill-rule=\"evenodd\" d=\"M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z\"/><path d=\"M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.822h.582c.01.224.18.38.42.38.254 0 .428-.158.428-.354 0-.211-.166-.36-.42-.36h-.328v-.422zm.042-4.593 1.056-.474v3.136h-.504V8.125h-.552v-.252zm0-4.004L2.812 2.79v3.137h-.504V3.532h-.553v-.264z\"/>"),
	link: e("<path d=\"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z\"/><path d=\"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z\"/>"),
	image: e("<path d=\"M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z\"/><path d=\"M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z\"/>"),
	video: e("<path d=\"M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z\"/><path d=\"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z\"/>"),
	codeBlock: e("<path d=\"M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z\"/>"),
	blockquote: e("<path d=\"M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z\"/>"),
	table: e("<path d=\"M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z\"/>"),
	divider: e("<path fill-rule=\"evenodd\" d=\"M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z\"/>"),
	undo: e("<path fill-rule=\"evenodd\" d=\"M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z\"/><path d=\"M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z\"/>"),
	redo: e("<path fill-rule=\"evenodd\" d=\"M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z\"/><path d=\"M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z\"/>"),
	sourceCode: e("<path d=\"M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z\"/><path d=\"M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z\"/>"),
	fullscreen: e("<path d=\"M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z\"/>")
}, n = class {
	container;
	editorArea;
	theme;
	config;
	locale;
	hooks;
	buttonElements = /* @__PURE__ */ new Map();
	headingSelectEl = null;
	constructor(e, t, n, r, i, a) {
		this.container = e, this.editorArea = t, this.theme = n, this.config = r, this.locale = i, this.hooks = a, this.render();
	}
	render() {
		this.container.innerHTML = "", this.container.setAttribute("role", "toolbar"), this.container.setAttribute("aria-label", "Editor Toolbar"), this.buttonElements.clear(), this.config.forEach((e) => {
			let n = Array.isArray(e) ? e : [e], r = document.createElement("div");
			r.className = this.theme.toolbarGroup, n.forEach((e) => {
				e === "heading" ? r.appendChild(this.createHeadingSelect()) : t[e] && r.appendChild(this.createButton(e));
			}), r.childNodes.length > 0 && this.container.appendChild(r);
		});
	}
	createHeadingSelect() {
		let e = document.createElement("select");
		return e.className = this.theme.select, [
			{
				val: "p",
				text: this.locale.toolbar.normal || "Normal"
			},
			{
				val: "h1",
				text: this.locale.toolbar.h1 || "H1"
			},
			{
				val: "h2",
				text: this.locale.toolbar.h2 || "H2"
			},
			{
				val: "h3",
				text: this.locale.toolbar.h3 || "H3"
			},
			{
				val: "h4",
				text: this.locale.toolbar.h4 || "H4"
			},
			{
				val: "h5",
				text: this.locale.toolbar.h5 || "H5"
			},
			{
				val: "h6",
				text: this.locale.toolbar.h6 || "H6"
			}
		].forEach((t) => {
			let n = document.createElement("option");
			n.value = t.val, n.textContent = t.text, e.appendChild(n);
		}), e.addEventListener("change", (e) => {
			let t = e.target;
			this.executeCommand("heading", t.value);
		}), this.headingSelectEl = e, e;
	}
	createButton(e) {
		if (e === "table") return this.createTablePickerButton(e);
		let n = document.createElement("button");
		return n.className = this.theme.button, n.innerHTML = t[e], n.title = this.locale.toolbar[e] || e, n.type = "button", n.setAttribute("aria-label", n.title), n.setAttribute("aria-pressed", "false"), n.addEventListener("click", (t) => {
			t.preventDefault(), (e === "sourceCode" || e === "fullscreen") && n.classList.toggle(this.theme.buttonActive), this.executeCommand(e);
		}), this.buttonElements.set(e, n), n;
	}
	updateState() {
		this.syncHeadingSelect(), this.syncButtonsState();
	}
	syncHeadingSelect() {
		if (this.headingSelectEl) try {
			let e = document.queryCommandValue("formatBlock").toLowerCase();
			this.headingSelectEl.value = e || "p";
		} catch {
			this.headingSelectEl.value = "p";
		}
	}
	syncButtonsState() {
		let e = {
			bold: "bold",
			italic: "italic",
			underline: "underline",
			strike: "strikeThrough",
			alignLeft: "justifyLeft",
			alignCenter: "justifyCenter",
			alignRight: "justifyRight",
			listUl: "insertUnorderedList",
			listOl: "insertOrderedList"
		};
		this.buttonElements.forEach((t, n) => {
			try {
				let r = !1;
				n === "blockquote" ? r = document.queryCommandValue("formatBlock").toLowerCase() === "blockquote" : e[n] && (r = document.queryCommandState(e[n])), r ? (t.classList.add(this.theme.buttonActive), t.setAttribute("aria-pressed", "true")) : (t.classList.remove(this.theme.buttonActive), t.setAttribute("aria-pressed", "false"));
			} catch {}
		});
	}
	executeCommand(e, t) {
		if (this.editorArea.focus(), e === "link") return void this.handleInsertLink();
		if (e === "image") return void this.handleInsertImage();
		if (e === "video") return void this.handleInsertVideo();
		let n = {
			bold: "bold",
			italic: "italic",
			underline: "underline",
			strike: "strikeThrough",
			alignLeft: "justifyLeft",
			alignCenter: "justifyCenter",
			alignRight: "justifyRight",
			listUl: "insertUnorderedList",
			listOl: "insertOrderedList",
			eraser: "removeFormat",
			divider: "insertHorizontalRule",
			undo: "undo",
			redo: "redo"
		};
		if (e === "heading" && t) document.execCommand("formatBlock", !1, t);
		else if (e === "blockquote") {
			let e = document.queryCommandValue("formatBlock").toLowerCase() === "blockquote" ? "p" : "blockquote";
			document.execCommand("formatBlock", !1, e);
		} else if (e === "inlineCode") {
			let e = window.getSelection();
			if (e && e.toString()) document.execCommand("insertHTML", !1, `<code>${e.toString()}</code>`);
			else if (e && e.rangeCount > 0) {
				let t = document.createElement("code");
				t.innerHTML = "&#8203;";
				let n = e.getRangeAt(0);
				n.insertNode(t), n.setStart(t, 1), n.collapse(!0), e.removeAllRanges(), e.addRange(n);
			}
		} else if (n[e]) document.execCommand(n[e], !1, "");
		else {
			let t = new CustomEvent("inkflow-custom-command", { detail: { command: e } });
			this.container.dispatchEvent(t);
			return;
		}
		this.updateState();
		let r = new CustomEvent("inkflow-format-changed");
		this.editorArea.dispatchEvent(r);
	}
	async handleInsertLink() {
		let e = this.saveSelection();
		if (!e) return;
		let t = this.hooks?.onInsertLink ? await this.hooks.onInsertLink() : window.prompt(this.locale.prompts.linkUrl, this.locale.prompts.linkDefault);
		t && (this.restoreSelection(e), document.execCommand("createLink", !1, t), this.postAsyncCommand());
	}
	async handleInsertImage() {
		let e = this.saveSelection();
		if (!e) return;
		let t = this.hooks?.onInsertImage ? await this.hooks.onInsertImage() : window.prompt(this.locale.prompts.imageUrl, this.locale.prompts.linkDefault);
		t && (this.restoreSelection(e), document.execCommand("insertImage", !1, t), this.postAsyncCommand());
	}
	async handleInsertVideo() {
		let e = this.saveSelection();
		if (!e) return;
		let t = this.hooks?.onInsertVideo ? await this.hooks.onInsertVideo() : window.prompt(this.locale.prompts.videoUrl, this.locale.prompts.linkDefault);
		if (!t) return;
		this.restoreSelection(e);
		let n = t.includes("<iframe") ? t : `<video src="${t}" controls style="max-width: 100%;"></video>`;
		document.execCommand("insertHTML", !1, n), this.postAsyncCommand();
	}
	saveSelection() {
		let e = window.getSelection();
		return !e || e.rangeCount === 0 ? null : e.getRangeAt(0).cloneRange();
	}
	restoreSelection(e) {
		this.editorArea.focus();
		let t = window.getSelection();
		t?.removeAllRanges(), t?.addRange(e);
	}
	postAsyncCommand() {
		this.updateState(), this.editorArea.dispatchEvent(new CustomEvent("inkflow-format-changed"));
	}
	createTablePickerButton(e) {
		let n = document.createElement("div");
		n.className = "inkflow-table-btn-wrapper";
		let r = document.createElement("button");
		r.className = this.theme.button, r.innerHTML = t[e], r.title = this.locale.toolbar[e] || e, r.type = "button", r.setAttribute("aria-label", r.title), r.setAttribute("aria-haspopup", "true"), r.setAttribute("aria-expanded", "false"), this.buttonElements.set(e, r);
		let i = document.createElement("div");
		i.className = "inkflow-table-picker";
		let a = document.createElement("div");
		a.className = "inkflow-table-picker-grid";
		let o = document.createElement("div");
		o.className = "inkflow-table-picker-label", o.innerText = "0 x 0";
		let s = this.buildTableGrid(i, o);
		return s.forEach((e) => a.appendChild(e)), i.appendChild(a), i.appendChild(o), n.appendChild(r), n.appendChild(i), this.bindTablePickerEvents(n, r, i, s, o), n;
	}
	buildTableGrid(e, t) {
		let n = [];
		for (let r = 1; r <= 10; r++) for (let i = 1; i <= 10; i++) {
			let a = document.createElement("div");
			a.className = "inkflow-table-picker-cell", a.dataset.row = r.toString(), a.dataset.col = i.toString(), a.addEventListener("mouseover", () => {
				t.innerText = `${r} x ${i}`, n.forEach((e) => {
					let t = parseInt(e.dataset.row), n = parseInt(e.dataset.col);
					t <= r && n <= i ? e.classList.add("is-hovered") : e.classList.remove("is-hovered");
				});
			}), a.addEventListener("click", () => {
				e.classList.remove("is-visible");
				let t = new CustomEvent("inkflow-custom-command", { detail: {
					command: "table",
					rows: r,
					cols: i
				} });
				this.container.dispatchEvent(t);
			}), n.push(a);
		}
		return n;
	}
	bindTablePickerEvents(e, t, n, r, i) {
		t.addEventListener("click", (e) => {
			e.preventDefault(), e.stopPropagation();
			let a = n.classList.contains("is-visible");
			a || (r.forEach((e) => e.classList.remove("is-hovered")), i.innerText = "0 x 0"), n.classList.toggle("is-visible"), t.setAttribute("aria-expanded", (!a).toString());
		}), document.addEventListener("click", (r) => {
			e.contains(r.target) || (n.classList.remove("is-visible"), t.setAttribute("aria-expanded", "false"));
		});
	}
}, r = {
	container: "inkflow-container",
	toolbar: "inkflow-toolbar",
	toolbarGroup: "inkflow-toolbar-group",
	button: "inkflow-btn",
	buttonActive: "is-active",
	select: "inkflow-select",
	editorArea: "inkflow-editor-body"
}, i = class {
	stack = [];
	currentIndex = -1;
	MAX_HISTORY_LENGTH = 50;
	MAX_HISTORY_BYTES = 5 * 1024 * 1024;
	constructor(e = "") {
		this.saveSnapshot(e);
	}
	getStackByteSize() {
		return this.stack.reduce((e, t) => e + t.length * 2, 0);
	}
	saveSnapshot(e) {
		if (!(this.currentIndex >= 0 && this.stack[this.currentIndex] === e)) for (this.currentIndex < this.stack.length - 1 && (this.stack = this.stack.slice(0, this.currentIndex + 1)), this.stack.push(e), this.currentIndex++; (this.stack.length > this.MAX_HISTORY_LENGTH || this.getStackByteSize() > this.MAX_HISTORY_BYTES) && this.stack.length > 1;) this.stack.shift(), this.currentIndex--;
	}
	undo() {
		return this.currentIndex > 0 ? (this.currentIndex--, this.stack[this.currentIndex]) : null;
	}
	redo() {
		return this.currentIndex < this.stack.length - 1 ? (this.currentIndex++, this.stack[this.currentIndex]) : null;
	}
}, a = {
	toolbar: {
		normal: "Normal",
		h1: "Heading 1",
		h2: "Heading 2",
		h3: "Heading 3",
		h4: "Heading 4",
		h5: "Heading 5",
		h6: "Heading 6",
		bold: "Bold",
		italic: "Italic",
		underline: "Underline",
		strike: "Strikethrough",
		inlineCode: "Inline Code",
		eraser: "Clear Formatting",
		alignLeft: "Align Left",
		alignCenter: "Align Center",
		alignRight: "Align Right",
		listUl: "Unordered List",
		listOl: "Ordered List",
		link: "Insert Link",
		image: "Insert Image",
		video: "Insert Video",
		codeBlock: "Code Block",
		blockquote: "Blockquote",
		table: "Insert Table",
		divider: "Divider",
		undo: "Undo",
		redo: "Redo",
		sourceCode: "Source Code",
		fullscreen: "Fullscreen"
	},
	prompts: {
		linkUrl: "Enter link URL:",
		imageUrl: "Enter image URL:",
		videoUrl: "Enter video URL (e.g., MP4 or YouTube iframe):",
		linkDefault: "https://"
	}
}, o = {
	toolbar: {
		normal: "正文",
		h1: "标题 1",
		h2: "标题 2",
		h3: "标题 3",
		h4: "标题 4",
		h5: "标题 5",
		h6: "标题 6",
		bold: "粗体",
		italic: "斜体",
		underline: "下划线",
		strike: "删除线",
		inlineCode: "行内代码",
		eraser: "清除格式",
		alignLeft: "左对齐",
		alignCenter: "居中对齐",
		alignRight: "右对齐",
		listUl: "无序列表",
		listOl: "有序列表",
		link: "插入链接",
		image: "插入图片",
		video: "插入视频",
		codeBlock: "插入代码块",
		blockquote: "引用块",
		table: "插入表格",
		divider: "插入分割线",
		undo: "撤销",
		redo: "重做",
		sourceCode: "源码模式",
		fullscreen: "全屏"
	},
	prompts: {
		linkUrl: "请输入链接地址:",
		imageUrl: "请输入图片地址:",
		videoUrl: "请输入视频链接 (如 MP4 或 B站 iframe):",
		linkDefault: "https://"
	}
}, s = class {
	events = /* @__PURE__ */ new Map();
	on(e, t) {
		this.events.has(e) || this.events.set(e, /* @__PURE__ */ new Set()), this.events.get(e).add(t);
	}
	off(e, t) {
		this.events.has(e) && this.events.get(e).delete(t);
	}
	emit(e, ...t) {
		if (this.events.has(e)) for (let n of this.events.get(e)) try {
			n(...t);
		} catch (t) {
			console.error(`[EventEmitter] Error in handler for event '${e}':`, t);
		}
	}
	clear() {
		this.events.clear();
	}
}, c = class extends s {
	options;
	theme;
	locale;
	containerEl;
	wrapperEl;
	toolbarEl;
	editorAreaEl;
	sourceCodeEl;
	isSourceMode = !1;
	toolbarInstance;
	history;
	historyTimeout = null;
	savedRange = null;
	constructor(e) {
		super(), this.options = e;
		let t = typeof e.container == "string" ? document.querySelector(e.container) : e.container;
		if (!t) throw Error("[InkflowEditor] Container element not found.");
		this.containerEl = t, this.theme = typeof e.theme == "object" ? e.theme : r, typeof e.lang == "object" ? this.locale = e.lang : this.locale = e.lang === "en-US" ? a : o;
		let n = this.containerEl.innerHTML.trim();
		this.initDOM(n), this.history = new i(this.getHTML());
	}
	initDOM(e = "") {
		this.createWrapper(), this.createToolbar(), this.createEditorArea(), this.createSourceArea(), e && (this.editorAreaEl.innerHTML = e), this.wrapperEl.appendChild(this.toolbarEl), this.wrapperEl.appendChild(this.editorAreaEl), this.wrapperEl.appendChild(this.sourceCodeEl), this.containerEl.innerHTML = "", this.containerEl.appendChild(this.wrapperEl), this.initializeToolbar(), this.bindEvents(), setTimeout(() => this.emit("ready", this), 0);
	}
	createWrapper() {
		this.wrapperEl = document.createElement("div"), this.wrapperEl.className = this.theme.container;
	}
	createToolbar() {
		this.toolbarEl = document.createElement("div"), this.toolbarEl.className = this.theme.toolbar;
	}
	createEditorArea() {
		this.editorAreaEl = document.createElement("div"), this.editorAreaEl.className = this.theme.editorArea, this.editorAreaEl.contentEditable = "true", this.options.placeholder && (this.editorAreaEl.dataset.placeholder = this.options.placeholder), this.options.height && (this.editorAreaEl.style.height = this.options.height, this.editorAreaEl.style.overflowY = "auto");
	}
	createSourceArea() {
		this.sourceCodeEl = document.createElement("textarea"), this.sourceCodeEl.className = "inkflow-source-area", this.sourceCodeEl.style.display = "none", this.sourceCodeEl.spellcheck = !1, this.options.height && (this.sourceCodeEl.style.height = this.options.height, this.sourceCodeEl.style.overflowY = "auto");
	}
	initializeToolbar() {
		let e = this.options.toolbar || [
			["heading"],
			[
				"bold",
				"italic",
				"underline",
				"strike",
				"inlineCode",
				"eraser"
			],
			[
				"alignLeft",
				"alignCenter",
				"alignRight"
			],
			["listUl", "listOl"],
			[
				"link",
				"image",
				"video",
				"codeBlock",
				"blockquote",
				"table",
				"divider"
			],
			["undo", "redo"],
			["sourceCode", "fullscreen"]
		];
		this.toolbarInstance = new n(this.toolbarEl, this.editorAreaEl, this.theme, e, this.locale, this.options.hooks);
	}
	getHTML() {
		return this.isSourceMode ? this.sourceCodeEl.value : this.formatOutputHTML(this.editorAreaEl.innerHTML);
	}
	getText() {
		return this.editorAreaEl.innerText || this.editorAreaEl.textContent || "";
	}
	setHTML(e) {
		this.editorAreaEl.innerHTML = e, this.saveHistoryNow();
	}
	saveHistoryNow() {
		let e = this.getHTML();
		this.history.saveSnapshot(e), this.emit("change", e);
	}
	destroy() {
		this.containerEl.innerHTML = "";
	}
	bindEvents() {
		this.editorAreaEl.addEventListener("focus", () => this.emit("focus")), this.editorAreaEl.addEventListener("blur", () => this.emit("blur")), this.editorAreaEl.addEventListener("keyup", () => this.handleSelectionSave()), this.editorAreaEl.addEventListener("mouseup", () => this.handleSelectionSave()), this.editorAreaEl.addEventListener("focusout", () => this.handleSelectionSave()), this.editorAreaEl.addEventListener("mouseup", () => this.toolbarInstance.updateState()), this.editorAreaEl.addEventListener("keyup", (e) => this.handleKeyboardEvent(e)), this.editorAreaEl.addEventListener("keydown", (e) => this.handleShortcuts(e)), this.editorAreaEl.addEventListener("paste", (e) => this.handlePasteEvent(e));
		let e = (e) => {
			e.dataTransfer?.types.includes("Files") && e.preventDefault();
		};
		this.wrapperEl.addEventListener("dragenter", e), this.wrapperEl.addEventListener("dragover", e), this.wrapperEl.addEventListener("drop", (e) => {
			e.dataTransfer?.files && e.dataTransfer.files.length > 0 && e.preventDefault(), (this.editorAreaEl.contains(e.target) || e.target === this.editorAreaEl) && this.handleDropEvent(e);
		}), this.editorAreaEl.addEventListener("inkflow-format-changed", () => this.saveHistoryNow()), this.toolbarEl.addEventListener("inkflow-custom-command", (e) => this.handleCustomCommand(e));
	}
	handleSelectionSave() {
		let e = window.getSelection();
		e && e.rangeCount > 0 && (this.savedRange = e.getRangeAt(0).cloneRange());
	}
	handleKeyboardEvent(e) {
		this.toolbarInstance.updateState(), [
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"Control",
			"Shift",
			"Alt",
			"Meta"
		].includes(e.key) || this.debounceSaveHistory(), (e.key === " " || e.code === "Space") && this.checkMarkdownRules();
	}
	handleShortcuts(e) {
		let t = e.metaKey || e.ctrlKey;
		t && e.key.toLowerCase() === "z" ? (e.preventDefault(), e.shiftKey ? this.performRedo() : this.performUndo()) : t && e.key.toLowerCase() === "y" && (e.preventDefault(), this.performRedo());
	}
	handlePasteEvent(e) {
		if (e.preventDefault(), !e.clipboardData) return;
		if (this.options.hooks?.onUploadImage && e.clipboardData.files && e.clipboardData.files.length > 0) for (let t = 0; t < e.clipboardData.files.length; t++) {
			let n = e.clipboardData.files[t];
			if (n.type.indexOf("image") !== -1) {
				this.processImageUpload(n);
				return;
			}
		}
		let t = e.clipboardData.getData("text/html"), n = e.clipboardData.getData("text/plain");
		t ? document.execCommand("insertHTML", !1, this.sanitizeHTML(t)) : n && document.execCommand("insertText", !1, n), this.saveHistoryNow();
	}
	handleDropEvent(e) {
		if (!this.options.hooks?.onUploadImage || !e.dataTransfer) return;
		let t = e.dataTransfer.files;
		if (!(!t || t.length === 0)) for (let n = 0; n < t.length; n++) {
			let r = t[n];
			if (r.type.indexOf("image") !== -1) {
				if (e.preventDefault(), document.caretRangeFromPoint) {
					let t = document.caretRangeFromPoint(e.clientX, e.clientY);
					if (t) {
						let e = window.getSelection();
						e && (e.removeAllRanges(), e.addRange(t));
					}
				}
				this.processImageUpload(r);
				return;
			}
		}
	}
	async processImageUpload(e) {
		let t = "upload-img-" + Math.random().toString(36).substring(2, 9), n = `<span id="${t}" class="inkflow-img-skeleton" contenteditable="false">🖼️ Uploading...</span>&nbsp;`;
		document.execCommand("insertHTML", !1, n);
		let r = this.options.hooks?.onUploadImage;
		if (r) try {
			let n = await r(e), i = this.editorAreaEl.querySelector(`#${t}`);
			i && (n ? (i.outerHTML = `<img src="${n}" alt="image" style="max-width:100%;height:auto;">&nbsp;`, this.saveHistoryNow()) : i.remove());
		} catch (e) {
			console.error("Image upload failed:", e);
			let n = this.editorAreaEl.querySelector(`#${t}`);
			n && n.remove();
		}
	}
	handleCustomCommand(e) {
		let t = e.detail;
		switch (t.command) {
			case "sourceCode":
				this.toggleSourceMode();
				break;
			case "fullscreen":
				this.toggleFullscreen();
				break;
			case "codeBlock":
				this.insertCodeBlock();
				break;
			case "table":
				this.insertTable(t.rows, t.cols);
				break;
		}
	}
	toggleSourceMode() {
		this.isSourceMode = !this.isSourceMode, this.isSourceMode ? (this.sourceCodeEl.value = this.formatOutputHTML(this.editorAreaEl.innerHTML), this.sourceCodeEl.style.height = `${this.editorAreaEl.offsetHeight}px`, this.editorAreaEl.style.display = "none", this.sourceCodeEl.style.display = "block") : (this.editorAreaEl.innerHTML = this.sourceCodeEl.value, this.editorAreaEl.style.height = `${this.sourceCodeEl.offsetHeight}px`, this.sourceCodeEl.style.display = "none", this.editorAreaEl.style.display = "block", this.saveHistoryNow());
	}
	toggleFullscreen() {
		this.wrapperEl.classList.contains("is-fullscreen") ? (this.containerEl.appendChild(this.wrapperEl), this.wrapperEl.classList.remove("is-fullscreen"), document.body.style.overflow = "") : (document.body.appendChild(this.wrapperEl), this.wrapperEl.classList.add("is-fullscreen"), document.body.style.overflow = "hidden");
	}
	insertCodeBlock() {
		document.execCommand("insertHTML", !1, "<pre><code>// Paste your code here...</code></pre><p><br></p>"), this.saveHistoryNow();
	}
	insertTable(e, t) {
		if (!e || !t) return;
		if (this.editorAreaEl.focus(), this.savedRange) {
			let e = window.getSelection();
			e?.removeAllRanges(), e?.addRange(this.savedRange);
		}
		let n = "<table><tbody>";
		for (let r = 0; r < e; r++) {
			n += "<tr>";
			for (let e = 0; e < t; e++) n += "<td><br></td>";
			n += "</tr>";
		}
		n += "</tbody></table><p><br></p>", document.execCommand("insertHTML", !1, n), this.saveHistoryNow();
	}
	debounceSaveHistory() {
		this.historyTimeout && window.clearTimeout(this.historyTimeout), this.historyTimeout = window.setTimeout(() => this.saveHistoryNow(), 500);
	}
	performUndo() {
		let e = this.history.undo();
		e !== null && (this.editorAreaEl.innerHTML = e, this.toolbarInstance.updateState());
	}
	performRedo() {
		let e = this.history.redo();
		e !== null && (this.editorAreaEl.innerHTML = e, this.toolbarInstance.updateState());
	}
	checkMarkdownRules() {
		let e = window.getSelection();
		if (!e || !e.focusNode) return;
		let t = e.focusNode, n = e.focusOffset;
		if (t.nodeType === Node.TEXT_NODE) {
			let r = !1, i = t.parentNode;
			for (; i && i !== this.editorAreaEl;) {
				if (i.nodeName === "PRE" || i.nodeName === "CODE") {
					r = !0;
					break;
				}
				i = i.parentNode;
			}
			if (!r) {
				let r = (t.textContent || "").substring(0, n);
				for (let i of [
					{
						regex: /\*\*([^*]+)\*\*[\s\u00A0]$/,
						tag: "strong"
					},
					{
						regex: /__([^_]+)__[\s\u00A0]$/,
						tag: "strong"
					},
					{
						regex: /\*([^*]+)\*[\s\u00A0]$/,
						tag: "em"
					},
					{
						regex: /_([^_]+)_[\s\u00A0]$/,
						tag: "em"
					},
					{
						regex: /~~([^~]+)~~[\s\u00A0]$/,
						tag: "del"
					},
					{
						regex: /`([^`]+)`[\s\u00A0]$/,
						tag: "code"
					}
				]) {
					let a = i.regex.exec(r);
					if (a) {
						let r = n - a[0].length, o = document.createRange();
						o.setStart(t, r), o.setEnd(t, n), o.deleteContents();
						let s = document.createElement(i.tag);
						s.textContent = a[1], o.insertNode(s);
						let c = document.createTextNode("\xA0");
						s.parentNode && s.parentNode.insertBefore(c, s.nextSibling), e.removeAllRanges();
						let l = document.createRange();
						l.setStart(c, 1), l.setEnd(c, 1), e.addRange(l), this.saveHistoryNow();
						return;
					}
				}
			}
		}
		let r = e.focusNode;
		for (; r && r.nodeType !== Node.ELEMENT_NODE;) r = r.parentNode;
		if (!r || r === this.editorAreaEl) return;
		let i = r.textContent || "";
		for (let e of [
			{
				prefix: "# ",
				command: "formatBlock",
				value: "H1"
			},
			{
				prefix: "## ",
				command: "formatBlock",
				value: "H2"
			},
			{
				prefix: "### ",
				command: "formatBlock",
				value: "H3"
			},
			{
				prefix: "> ",
				command: "formatBlock",
				value: "BLOCKQUOTE"
			},
			{
				prefix: "- ",
				command: "insertUnorderedList",
				value: void 0
			}
		]) if (i === e.prefix || i === e.prefix.replace(" ", "\xA0")) {
			r.textContent = "", this.editorAreaEl.focus(), document.execCommand(e.command, !1, e.value), this.saveHistoryNow();
			break;
		}
	}
	sanitizeHTML(e) {
		let t = new DOMParser().parseFromString(e, "text/html").body;
		return [
			"script",
			"style",
			"meta",
			"iframe",
			"object",
			"embed"
		].forEach((e) => t.querySelectorAll(e).forEach((e) => e.remove())), t.querySelectorAll("*").forEach((e) => {
			e.removeAttribute("style"), e.removeAttribute("class"), e.removeAttribute("id"), Array.from(e.attributes).forEach((t) => {
				t.name.toLowerCase().startsWith("on") && e.removeAttribute(t.name);
			});
		}), t.innerHTML;
	}
	formatOutputHTML(e) {
		let t = new DOMParser().parseFromString(e, "text/html").body;
		t.querySelectorAll("b").forEach((e) => {
			let t = document.createElement("strong");
			t.innerHTML = e.innerHTML, e.replaceWith(t);
		}), t.querySelectorAll("i").forEach((e) => {
			let t = document.createElement("em");
			t.innerHTML = e.innerHTML, e.replaceWith(t);
		});
		let n = !0, r = [
			"p",
			"div",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"blockquote"
		];
		for (; n;) {
			n = !1;
			let e = t.querySelectorAll("*");
			for (let t = 0; t < e.length; t++) {
				let i = e[t];
				if (r.includes(i.tagName.toLowerCase())) {
					let e = i.querySelector("img") !== null, t = i.innerHTML.trim().toLowerCase() === "<br>";
					!e && ((i.textContent || "").trim() === "" || t) && (i.remove(), n = !0);
				}
			}
		}
		return t.innerHTML === "<br>" ? "" : t.innerHTML;
	}
};
//#endregion
export { c as InkflowEditor, r as inkflowTheme };
