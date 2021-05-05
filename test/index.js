import assert from 'assert';
import url from 'url';
import sinon from 'sinon';
import { debounce } from 'throttle-debounce';
import function_ from '../index';

const scrollResizeHandler = (handler) => debounce(300, handler);

function wait(time) {
	return new Promise((resolve) => {
		setTimeout(resolve, time);
	});
}

function scrollAndWait(offset, time) {
	window.scrollTo(0, offset);
	return wait(time);
}

function getNodeOffset(node) {
	const rect = node.getBoundingClientRect();
	return (
		rect.top + (window.pageYOffset || document.documentElement.scrollTop)
	);
}

const defaultTimeout = 300 + 100;

before(function () {
	window.fixture.load('/test/fixtures/index.html');
});

after(function () {
	window.fixture.cleanup();
});

it('should handle default behavior', async function () {
	this.timeout(20_000);

	const element = document.querySelector('.Test-image--success');
	const spy = sinon.spy();

	const instance = function_(element, {
		scrollResizeHandler: scrollResizeHandler,
		onEnter: spy
	});

	await scrollAndWait(100, defaultTimeout);
	await scrollAndWait(200, defaultTimeout);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(0, defaultTimeout);

	instance.destroy();

	await wait(2000);

	const dataSource = element.getAttribute('data-src');
	const { pathname: source } = url.parse(element.src);

	assert.equal(spy.callCount, 1);
	assert.equal(source, dataSource);
});

it('should handle success callback', async function () {
	this.timeout(20_000);

	const element = document.querySelector('.Test-image--success');
	const spy = sinon.spy();

	const instance = function_(element, {
		scrollResizeHandler: scrollResizeHandler,
		onEnter: spy,
		onSuccess: spy
	});

	await scrollAndWait(100, defaultTimeout);
	await scrollAndWait(200, defaultTimeout);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(0, defaultTimeout);

	instance.destroy();

	assert.equal(spy.callCount, 2);
});

it('should handle fail callback', async function () {
	this.timeout(20_000);

	const element = document.querySelector('.Test-image--fail');
	const spy = sinon.spy();

	const instance = function_(element, {
		scrollResizeHandler: scrollResizeHandler,
		onEnter: spy,
		onFail: spy
	});

	await scrollAndWait(100, defaultTimeout);
	await scrollAndWait(200, defaultTimeout);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(300, defaultTimeout);
	await scrollAndWait(getNodeOffset(element), defaultTimeout + 1000);
	await scrollAndWait(0, defaultTimeout);

	instance.destroy();

	await wait(2000);

	const dataSource = element.getAttribute('data-src');
	const { pathname: source } = url.parse(element.src);

	assert.equal(spy.callCount, 2);
	assert.notEqual(source, dataSource);
});
