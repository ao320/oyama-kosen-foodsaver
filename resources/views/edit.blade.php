@extends('layouts.app')

@section('content')
<div class="main">
    <div class="container d-flex justify-content-center edit-blade" id="background">
        <a href="/home" class="home">食材</a>
        <div class="edit">編集</div>
        <a href="/create" class="create">登録</a>
    </div>
    <div class="edit-body">
        @foreach($foods as $food)
        @endforeach
        <form method='POST' action="{{ route('update', ['id' => $food->id ] ) }}">
        @csrf
        <input type='hidden' name='user_id' value="{{ $user['id'] }}">
        食材名：<input type="text" class="form-control" value="{{ $food->foods_name }}" name="foods_name"><br>
        重量：<input type="number" class="form-control" value="{{ $food->weight }}" name="weight">
        <button type="submit" class="btn btn-warning submit">保存</button>
    </div>
</div>
@endsection
