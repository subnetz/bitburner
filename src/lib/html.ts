export function createElement(type: string, props: Object | null, ...children) {
	const doc = eval('document') as Document;
	let el = doc.createElement(type);

	applyProperties(el, props);

	children.forEach((child) => {
		if (typeof child == 'string') {
			el.textContent = child;
		} else {
			el.appendChild(child);
		}
	});
	return el;
}

export function appendChild(node, ...children) {
	children.forEach(node.appendChild);
	return node;
}

function applyProperties(node, props) {
	if (!props) {
		return;
	}
	Object.entries(props).forEach(([key, value]) => {
		if (typeof value == 'object') {
			if (!node[key]) {
				node[key] = {};
			}
			applyProperties(node[key], value);
		} /* else if (typeof value == 'function') {
			node[key] = value;
		} */ else {
			node[key] = value;
		}
	});
}
