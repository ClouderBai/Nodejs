const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')
const { loadFile } = require('./common/load_file')


try {





	function effect(fn, options = {}) {
		const effect = createReactiveEffect(fn, options)
		
		
		if(!options.lazy) {
			effect()
		}
		return effect
	}
	
	// createReactiveEffect
	let uid = 0;
	let activeEffect;
	const effectStack = []
	function createReactiveEffect(fn, options) {
		const effect = function reactiveEffect(options) {
			if(!effectStack.includes(effect)) {
				try {
					effectStack.push(effect)
					activeEffect = effect;
					fn()
				} catch (err) {
					
					
				} finally {
					effectStack.pop()
					activeEffect = effectStack[effectstack.length - 1]
				}
			}
		}
		effect.id = uid++;
		effect._isEffect = true;
		effect.raw = fn;
		effect.options = options;
		return effect;
	}



	const TrackOpTypes = {
		GET: 'GET',
	}


	const res = Reflect.get(target, key, receiver);
	if(!isReadonly) {
		console.log('run effect, get value', 'collect effect')
		track(target, TrackOpTypes.GET, key)
	}
	if(shallow) {
		return res;
	}

	const targetMap = new WeakMap();
	function track(target, type, key) {
		activeEffect
		if(activeEffect === undefined) {
			return
		}
		let depsMap = targetMap.get(target)
		if(!depsMap) {
			targetMap.set(target, (depsMap = new Map))
		}
		let dep = depsMap.get(key)
		if(!dep) {
			depsMap.set(key, (dep = new Set))
		}
		if(!dep.has(activeEffect)) {
			dep.add(activeEffect)
		}
	}



	// 
	let { reactive } = VueReactivity;
	let state = reactive({ name 'zf1', age: 12 })

	effect(() => { console.log('----------app: -------------', state.name, ',', state.age) })

	setTimeout(() => { state.name = 'hello' }, 1e3)




	











} catch (err) {
    console.log(err);
}