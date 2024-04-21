import {useState} from "react"
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions} from "react-native"
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler"
import {data} from "./utils/data"
import Animated, {Extrapolation, interpolate, interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming} from "react-native-reanimated"

const TIME_TO_ACTIVATE_PAN = 100
const TOUCH_SLOP = 5

export default () => {
    const {width} = useWindowDimensions()

    const [items, setItems] = useState(data)

    const handleComplete = (id) => {
        console.log('Se completa elemento: ', items.find(x => x.id === id))
        const nuevos = items.filter(x => x.id !== id)
        setItems(nuevos)
    }

    const Item = ({id, title}) => {
        
        const itemHeight = useSharedValue(55)
        const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
        const context = useSharedValue(0)
        const swipeTranslateX = useSharedValue(0)
        const pressed = useSharedValue(false) 

        const pan = Gesture.Pan()

            .manualActivation(true)
            .onTouchesDown((e) => {
                touchStart.value = {
                    x: e.changedTouches[0].x,
                    y: e.changedTouches[0].y,
                    time: Date.now(),
                };
            })
            .onTouchesMove((e, state) => {
                if ((Date.now() - touchStart.value.time) > TIME_TO_ACTIVATE_PAN) state.activate();
                else if (
                    Math.abs(touchStart.value.x - e.changedTouches[0].x) > TOUCH_SLOP ||
                    Math.abs(touchStart.value.y - e.changedTouches[0].y) > TOUCH_SLOP
                ) state.fail();
            })

            .onBegin(() => {
                pressed.value = true
                context.value = {x: swipeTranslateX.value}
            })
            .onChange((event) => {
                swipeTranslateX.value = event.translationX + context.value.x;
            })
            .onFinalize(() => {
                const direction = swipeTranslateX.value < 0 ? 'LEFT' : 'RIGHT'
                
                const shouldDismiss = swipeTranslateX.value < (-width * 0.5) || swipeTranslateX.value > (width * 0.5)
                
                if (shouldDismiss) {
                    if(direction === 'LEFT'){
                        swipeTranslateX.value = withTiming(-200, undefined, (isDone) => {
                            if (isDone) {}
                        })
                    } else {
                        swipeTranslateX.value = withTiming(width, undefined, (isDone) => {
                            if (isDone) {
                                runOnJS(handleComplete)(id)
                            }
                        })
                        itemHeight.value = withTiming(0)
                    }
                } else swipeTranslateX.value = withSpring(0);
                pressed.value = false
            });

        const translateStyles = useAnimatedStyle(() => ({
            transform: [
                {translateX: swipeTranslateX.value},
                {scale: withSpring(pressed.value ? 1.15 : 1)}
            ]
        }))

        const heightStyles = useAnimatedStyle(() => ({
            height: itemHeight.value
        }))

        const leftSectionStyles = useAnimatedStyle(() => ({
            backgroundColor: interpolateColor(
                swipeTranslateX.value,
                [0, (width * 0.5)],
                ['rgba(255,255,255,1)', 'rgba(104,189,88,1)'],
                'RGB',
                Extrapolation.CLAMP
            ),
            width: `${interpolate(
                swipeTranslateX.value,
                [0, width],
                [0, 100],
                Extrapolation.CLAMP
            )}%`,
        }))

        const rightSectionStyles = useAnimatedStyle(() => ({
            width: interpolate(
                swipeTranslateX.value,
                [0, -200],
                [0, 200]
            )
        }))
            
        return(
            <GestureDetector gesture={pan}>
                <Animated.View style={heightStyles}>
                    <Animated.View style={[styles.itemContainer, translateStyles, {borderBottomWidth: 1, borderBottomColor: '#dadada'}]}>
                        <Text style={styles.itemTitle}>{title}</Text>
                    </Animated.View>

                    {/* Left Section */}
                    <Animated.View style={[styles.itemContainer, leftSectionStyles, {backgroundColor: 'rgba(104,189,88,1)', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 0}]}>
                        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>Completado</Text>
                    </Animated.View>
                    
                    {/* Right Section */}
                    <Animated.View style={[styles.itemContainer, rightSectionStyles, {paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 0, zIndex: 0}]}>
                        <TouchableOpacity onPressIn={() => console.log('editar')} style={{flex: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4179C1'}}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPressIn={() => console.log('eliminar')} style={{flex: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', backgroundColor: '#C14143'}}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>Eliminar</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </Animated.View>
            </GestureDetector>
        )
    }

    return(
        <>
            <SafeAreaView style={{backgroundColor: '#f9f9f9'}}/>
            <GestureHandlerRootView style={styles.container}>
                <View style={{height: 50, alignSelf: 'stretch', backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#dadada', paddingHorizontal: 12, justifyContent: 'center', alignItems: 'flex-start'}}>
                    <Text style={{fontSize: 24, fontWeight: 'bold', color: '#4179C1'}}>Recordatorios</Text>
                </View>
                <ScrollView 
                    showsVerticalScrollIndicator={true}
                    style={styles.scroll}>
                    {
                        items.map(x => 
                            <Item key={x.id} {...x}/>    
                        )
                    }
                </ScrollView>
            </GestureHandlerRootView>
            <SafeAreaView style={{backgroundColor: '#f9f9f9'}}/>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        height: 'auto',
        alignSelf: 'stretch'
    },
    itemContainer: {
        height: 55,
        alignSelf: 'stretch',
        paddingHorizontal: 12,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
        zIndex: 10 
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#383838' 
    }
})