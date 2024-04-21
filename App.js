import 'react-native-gesture-handler';
import {Provider} from 'react-redux'
import {store} from './src/store'
import App from './src/index'

export default () => {
    return(
        <Provider store={store}>
            <App />
        </Provider>
    )
}