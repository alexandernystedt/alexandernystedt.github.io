var delta = 0;

let old_time = 0;

function update_delta()
{
    let time = performance.now();
    delta = (time - old_time) * 0.001;
    old_time = time;
}

export { update_delta, delta };