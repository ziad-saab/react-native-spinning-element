var React = require('react');
var {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder
} = require('react-native');

var CIRCLE_DIMENSIONS = 300;
var SpinningElement = React.createClass({

  getInitialState: function() {
    return {
        rotate: new Animated.Value(0),
        gestureState: null
    };
  },
  componentWillMount: function() {
    this._animatedRotateValue = 0;
    this.state.rotate.addListener(value => this._animatedRotateValue = value.value);

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, gestureState) => {
        this.state.rotate.setOffset(this._animatedRotateValue);
        const initialVector = [gestureState.x0 - this.centerX, gestureState.y0 - this.centerY];
        this.initialAngle = Math.atan2(...initialVector);
      },
      onPanResponderMove: (e, gestureState) => {
        const currentVector = [gestureState.moveX - this.centerX, gestureState.moveY - this.centerY];
        const newAngle = Math.atan2(...currentVector);
        const angleDiff = (newAngle - this.initialAngle) * 360 / (Math.PI * 2);
        this.state.rotate.setValue(-angleDiff);
      },
      onPanResponderRelease: (e, gestureState) => {
        const velocity = [gestureState.vx, gestureState.vy];
        const velocityMag = Math.sqrt(velocity[0]*velocity[0] + velocity[1]*velocity[1]);

        const currentVector = [gestureState.moveX - this.centerX, gestureState.moveY - this.centerY];
        const currentVectorMag = Math.sqrt(currentVector[0]*currentVector[0] + currentVector[1]*currentVector[1]);
        const currentVectorNorm = [currentVector[0] / currentVectorMag, currentVector[1] / currentVectorMag];

        const vxComponent = velocity[0] * currentVectorNorm[0] + velocity[1] * currentVectorNorm[1];
        const vyComponent = Math.sqrt(velocityMag*velocityMag - vxComponent*vxComponent);

        this.state.rotate.flattenOffset();
        if (!isNaN(vyComponent)) { // TODO: why?
          Animated.decay(this.state.rotate, {
            velocity: vyComponent,
            deceleration: 0.997
          }).start();
        }
        this.setState({vyComponent})
      }
    });
  },
  componentWillUnmount: function() {
    this.state.rotate.removeAllListeners();
  },
  getStyle: function() {
    return [
      styles.circle,
      {
        transform: [
          {
            rotateZ: (
              Animated.modulo(
                this.state.rotate, 360
              ).interpolate({
                inputRange: [0, 359],
                outputRange: ['0deg', '359deg']
              })
            )
          }
        ]
      }
    ];
  },
  _onLayout: function({nativeEvent: {layout}}) {
    this.centerX = layout.x + layout.width / 2;
    this.centerY = layout.y + layout.height / 2;
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View
          style={styles.circleContainer}
          onLayout={this._onLayout}
        >
          <Animated.View
            style={this.getStyle()}
            {...this._panResponder.panHandlers}
          >
            <View style={styles.txtContainer}><Text style={styles.txt}>W</Text></View>
          </Animated.View>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  circleContainer: {
    width: CIRCLE_DIMENSIONS,
    height: CIRCLE_DIMENSIONS,
    borderWidth: 1,
    borderColor: '#ff0000',
    borderStyle: 'solid'
  },
  circle: {
    width: CIRCLE_DIMENSIONS,
    height: CIRCLE_DIMENSIONS,
    borderRadius: CIRCLE_DIMENSIONS / 2,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center'
  },
  txtContainer: {
    width: Math.sqrt(2 * Math.pow(CIRCLE_DIMENSIONS / 2, 2)),
    height: Math.sqrt(2 * Math.pow(CIRCLE_DIMENSIONS / 2, 2)),
    borderColor: '#00ff00',
    borderWidth: 1,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center'
  },
  txt: {
    fontSize: 100,
    fontWeight: 'bold',
  }
});
