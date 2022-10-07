@extends('layouts.app')

@section('content')
<div class="container d-flex justify-content-center home-blade" id="background">
    <a href="/home" class="home">食材</a>
    <div class="edit">編集</div>
    <a href="/create" class="create">登録</a>
</div>
<div class="table">
    <table class="table table-stripted table-bordered">
        <thead>
            <tr>
                <th>食品名</th>
                <th>重量</th>
                <th>編集</th>
                <th>削除</th>
            </tr>
        </thead>
        @foreach($foods as $food)
        <?php if($food->status == 1){?>
        <tbody>
            <td>{{$food->foods_name}}</td>
            <td>{{$food->weight}}g</td>
            <td><a href="/edit/{{$food->id}}" class="text-secondary">編集</a></td>
            <td><a href="/delete/{{$food->id}}" class="text-danger">削除</a></td>
        </tbody>
        <?php } ?>
        @endforeach
    </table>
</div>
@endsection
