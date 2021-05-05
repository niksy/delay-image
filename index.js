import elementWithinViewport from 'element-within-viewport';
import loadImage from 'image-promise';

const defaultScrollResizeHandler = (handler) => handler;

export default (element, options = {}) => {
	const {
		threshold = 0,
		scrollResizeHandler = defaultScrollResizeHandler,
		imageSource = element.dataset.src,
		onEnter = (node) => {},
		onSuccess = (node) => {
			node.src = imageSource;
		},
		onFail = (node) => {}
	} = options;

	const instance = elementWithinViewport(element, {
		threshold: threshold,
		scrollResizeHandler: scrollResizeHandler,
		once: true,
		onEnter: () => {
			onEnter(element);
			loadImage(imageSource)
				.then(() => onSuccess(element))
				.catch(() => onFail(element));
		}
	});

	return instance;
};
